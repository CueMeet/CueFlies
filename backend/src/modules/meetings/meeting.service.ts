import { Injectable, NotFoundException } from '@nestjs/common';
import {
  User,
  Meeting,
  MeetingAttendees,
  ExecutionLog,
} from 'src/database/postgres/models';
import {
  GetMeetingsOptionsInput,
  InitializeMeetingBotInput,
  TranscriptPaginationInput,
} from './input/get-meetings-options.input';
import {
  MeetingPlatformEnum,
  MeetingStatusEnum,
  MeetingTypeEnum,
} from 'src/utils/enums';
import * as moment from 'moment-timezone';
import { Op } from 'sequelize';
import { CLIENT_DATE_FORMAT, getOccurrences } from 'src/utils/helpers/date';
import { ExecutionLogEnum } from 'src/database/postgres/models/execution-log.model';
import { MeetingsPaginated } from './output/meeting-paginated.object';
import { v4 as uuidv4 } from 'uuid';
import { CueMeetService } from 'src/providers/cuemeet/cuemeet.service';
import { MeetingOutput } from './output/meeting-paginated.object';

@Injectable()
export class MeetingService {
  constructor(private cueMeetService: CueMeetService) {}

  async getMeetings(user: User, options: GetMeetingsOptionsInput) {
    const data: MeetingsPaginated[] = [];
    const where: any = {
      userId: user.id,
      meetingType: MeetingTypeEnum.NON_RECURRING,
    };

    if (options.date) {
      where.startTime = {
        [Op.gte]: moment(options.date, CLIENT_DATE_FORMAT)
          .tz(options.tz)
          .startOf('day')
          .toISOString(),
        [Op.lt]: moment(options.date, CLIENT_DATE_FORMAT)
          .tz(options.tz)
          .endOf('day')
          .toISOString(),
      };
    }

    const meetings = await Meeting.findAll({
      where,
      limit: options.limit,
      offset: options.offset,
    });

    // get recurring meetings
    const recurringMeetings = await Meeting.findAll({
      where: { userId: user.id, meetingType: MeetingTypeEnum.RECURRING },
    });

    // update start time and end time with today's date
    for (const meeting of recurringMeetings) {
      const occurrences = getOccurrences(
        options.date,
        options.tz,
        meeting.rrule,
      );

      if (!(Array.isArray(occurrences) && occurrences.length > 0)) continue;

      const matchOccurrence = occurrences.find((occurrence: any) => {
        const occurrenceDate = moment(occurrence).tz(options.tz).startOf('day');
        const requestDate = moment(options.date, CLIENT_DATE_FORMAT)
          .tz(options.tz)
          .startOf('day');

        return occurrenceDate.isSame(requestDate, 'day');
      });

      if (!matchOccurrence) continue;

      const changedMeetings = await Meeting.count({
        where: {
          id: meeting.id,
          userId: meeting.userId,
          meetingType: MeetingTypeEnum.NON_RECURRING,
          startTime: {
            [Op.gte]: moment(options.date, CLIENT_DATE_FORMAT)
              .startOf('day')
              .toISOString(),
            [Op.lt]: moment(options.date, CLIENT_DATE_FORMAT)
              .endOf('day')
              .toISOString(),
          },
        },
      });

      if (changedMeetings > 0) continue;

      const duration = moment(meeting.endTime).diff(
        meeting.startTime,
        'minute',
      );
      meeting.startTime = matchOccurrence.toISOString();
      meeting.endTime = moment(matchOccurrence)
        .clone()
        .add(duration, 'minute')
        .toISOString();

      meetings.push(meeting);
    }

    // get attendees, deal, isRecorded, isBotLive
    for (const meeting of meetings) {
      const attendees = await MeetingAttendees.findAll({
        where: {
          meetingICalUID: meeting.id,
          meetingId: meeting.meetingId,
          userId: meeting.userId,
        },
      });

      const isRecorded = await this.isMeetingRecorded(
        meeting.id,
        meeting.meetingId,
        meeting.userId,
        meeting.meetingType,
        moment(options.date, CLIENT_DATE_FORMAT).tz(options.tz),
      );

      const isBotLive = await this.isMeetingBotLive(
        meeting.id,
        meeting.meetingId,
        meeting.userId,
        meeting.meetingType,
        moment(options.date, CLIENT_DATE_FORMAT).tz(options.tz),
      );

      data.push({ meeting, attendees, isRecorded, isBotLive });
    }

    return data;
  }

  async getMeetingTranscript(
    meetingId: string,
    user: User,
    pagination: TranscriptPaginationInput = { page: 1, limit: 10 },
  ): Promise<MeetingOutput> {
    try {
      const meeting = await Meeting.findOne({
        where: { id: meetingId, userId: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['cueMeetApiKey', 'cueMeetUserId'],
          },
        ],
      });

      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      const attendees = await MeetingAttendees.findAll({
        where: {
          meetingICalUID: meeting.id,
          meetingId: meeting.meetingId,
          userId: meeting.userId,
        },
      });

      let transcript = null;
      let transcriptPagination = null;

      if (meeting.cuemeetBotId) {
        const transcriptResponse = await this.cueMeetService.retrieveTranscript(
          meeting.user.cueMeetApiKey,
          meeting.cuemeetBotId,
          pagination,
        );

        if (transcriptResponse?.transcript) {
          transcript = transcriptResponse.transcript;
          transcriptPagination = {
            page: pagination.page,
            limit: pagination.limit,
            total: transcriptResponse.total || 0,
            hasMore: transcriptResponse.hasMore || false,
          };
        }
      }

      return { meeting, attendees, transcript, transcriptPagination };
    } catch (error) {
      console.error('Error in getMeetingTranscript:', error);
      throw new Error('Failed to retrieve meeting transcript');
    }
  }

  async isMeetingRecorded(
    id: string,
    meetingId: string,
    userId: string,
    type: string,
    today = moment(),
  ): Promise<boolean> {
    if (type === MeetingTypeEnum.NON_RECURRING) {
      const executionLogs = await ExecutionLog.count({
        where: {
          meetingId: meetingId,
          meetingICalUID: id,
          userId,
          status: {
            [Op.notIn]: [ExecutionLogEnum.STOPPED, ExecutionLogEnum.FAILED],
          },
        },
      });

      return executionLogs > 0;
    }

    if (type === MeetingTypeEnum.RECURRING) {
      const executionLogs = await ExecutionLog.count({
        where: {
          meetingId: meetingId,
          meetingICalUID: id,
          userId,
          status: {
            [Op.notIn]: [ExecutionLogEnum.STOPPED, ExecutionLogEnum.FAILED],
          },
          createdAt: {
            [Op.gte]: today.startOf('day').toISOString(),
            [Op.lt]: today.endOf('day').toISOString(),
          },
        },
      });

      return executionLogs > 0;
    }

    return false;
  }

  async isMeetingBotLive(
    id: string,
    meetingId: string,
    userId: string,
    type: string,
    today = moment(),
  ): Promise<boolean> {
    if (type === MeetingTypeEnum.NON_RECURRING) {
      const executionLogs = await ExecutionLog.count({
        where: {
          meetingId: meetingId,
          meetingICalUID: id,
          userId,
          status: ExecutionLogEnum.RUNNING,
        },
      });

      return executionLogs > 0;
    }

    if (type === MeetingTypeEnum.RECURRING) {
      const executionLogs = await ExecutionLog.count({
        where: {
          meetingId: meetingId,
          meetingICalUID: id,
          userId,
          status: ExecutionLogEnum.RUNNING,
          createdAt: {
            [Op.gte]: today.startOf('day').toISOString(),
            [Op.lt]: today.endOf('day').toISOString(),
          },
        },
      });

      return executionLogs > 0;
    }

    return false;
  }

  private async identifyMeetingPlatform(meetingLink: string) {
    if (meetingLink.startsWith('https://meet.google.com/')) {
      return MeetingPlatformEnum.GOOGLE_MEET;
    } else if (/https?:\/\/(.*?\.)?zoom\.us\/j\/\d+/.test(meetingLink)) {
      return MeetingPlatformEnum.ZOOM;
    } else if (
      /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/\S+/.test(meetingLink)
    ) {
      return MeetingPlatformEnum.TEAMS;
    } else {
      return undefined;
    }
  }

  async initializeMeetingBot(user: User, options: InitializeMeetingBotInput) {
    const meetingPlatform = await this.identifyMeetingPlatform(
      options.meetingUrl,
    );
    if (!meetingPlatform) throw new Error('Invalid meeting link.');

    const meetingId = uuidv4();
    const meeting = await Meeting.create({
      id: meetingId,
      userId: user.id,
      meetingId: meetingId,
      meetLink: options.meetingUrl,
      meetingType: MeetingTypeEnum.NON_RECURRING,
      platform: meetingPlatform,
      title: options.name || 'CueFlies Note Taker',
      startTime: moment().toISOString(),
      endTime: moment().add(1, 'hour').toISOString(),
      status: MeetingStatusEnum.CREATED,
    });

    try {
      const meetingBot = await this.cueMeetService.createBot(
        user.cueMeetApiKey,
        `${user.name.split(' ')[0]} - CueFlies Note Taker`,
        options.meetingUrl,
      );

      meeting.cuemeetBotId = meetingBot.id;
      await meeting.save();

      await ExecutionLog.create({
        userId: user.id,
        botUsedId: user.cueMeetUserId,
        botId: meetingBot.id,
        meetingId: meeting.meetingId,
        meetingICalUID: meeting.id,
        status: ExecutionLogEnum.RUNNING,
      });

      return { status: true, meetingId: meeting.id };
    } catch (error) {
      // Rollback created meeting and execution log
      await meeting.destroy();
      throw error;
      console.log(error);
    }
  }
}

import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as moment from 'moment-timezone';
import { rrulestr } from 'rrule';
import { Op } from 'sequelize';

import {
  GOOGLE_CALENDAR_DELETE_EVENTS,
  GOOGLE_CALENDAR_EVENT_PROCESSOR,
  GOOGLE_CALENDAR_PUSH_EVENTS,
} from '../../../constants/bull-queue';
import {
  MeetingPlatformEnum,
  MeetingStatusEnum,
  MeetingTypeEnum,
} from '../../../utils/enums';
import {
  Meeting,
  MeetingAttendees,
  RecurringMeeting,
} from '../../../database/postgres/models';
// import { MeetingsService } from `@/modules/meetings/meetings.service`;

@Processor(GOOGLE_CALENDAR_EVENT_PROCESSOR)
export class GoogleCalenderProcessor {
  // constructor(private readonly meetingService: MeetingsService) {}
  constructor() {}
  public readonly logger = new Logger(GoogleCalenderProcessor.name);

  @Process(GOOGLE_CALENDAR_PUSH_EVENTS)
  async GoogleCalendarPushEvents(job: Job): Promise<void> {
    try {
      const { user, events } = job.data;
      // console.log('events', events);

      if (events.length === 0) {
        return;
      }

      for (const event of events) {
        if (event.status === 'cancelled') {
          await this.deleteMeeting(event.id, user.id);
        } else {
          if (!event.hasOwnProperty('iCalUID')) continue;
          const existingMeeting = await Meeting.findOne({
            where: { id: event.iCalUID, meetingId: event.id, userId: user.id },
          });
          if (existingMeeting) {
            await this.updateMeeting(event, user.id);
          } else {
            await this.createNewMeeting(event, user.id);
          }
        }
      }

      this.logger.log(`Processed ${events.length} events for user ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Error processing Google Calendar events: ${error.message}`,
      );
      throw error;
    }
  }

  // Delete future meeting of the user
  @Process(GOOGLE_CALENDAR_DELETE_EVENTS)
  async GoogleCalendarDeleteFutureEvents(job: Job): Promise<void> {
    try {
      const { user } = job.data;
      const disconnectedTime = moment();

      // Find all future meetings
      const futureMeetings = await Meeting.findAll({
        where: {
          userId: user.id,
          startTime: {
            [Op.gt]: disconnectedTime.toISOString(),
          },
        },
      });
      this.logger.log(
        `Found ${futureMeetings.length} future meetings for user ${user.id}`,
      );

      for (const meeting of futureMeetings) {
        // Delete meeting attendees
        await MeetingAttendees.destroy({
          where: {
            meetingICalUID: meeting.id,
            meetingId: meeting.meetingId,
          },
        });

        // Delete recurring meeting
        await RecurringMeeting.destroy({
          where: {
            meetingICalUID: meeting.id,
            meetingId: meeting.meetingId,
          },
        }); // meetingId: event.id, meetingICalUID: event.iCalUID

        // Delete meeting
        await Meeting.destroy({
          where: {
            id: meeting.id,
            meetingId: meeting.meetingId,
          },
        });
      }

      // close all recurring meetings
      const recurringMeetings = await Meeting.findAll({
        where: {
          userId: user.id,
          meetingType: MeetingTypeEnum.RECURRING,
        },
      });

      for (const meeting of recurringMeetings) {
        const rrule = meeting.rrule;
        if (rrule) {
          const rule = rrulestr(rrule);
          const now = disconnectedTime.utc().toDate();
          const futureOccurrences = rule.between(
            now,
            moment().utc().add(1, 'year').toDate(),
          );

          if (futureOccurrences.length > 0) {
            rule.origOptions.until = now;
            await meeting.update({ rrule: rule.toString() });
          }
        }
      }

      this.logger.log(`Deleted future events for user ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting Google Calendar events: ${error.message}`,
      );
      throw new Error(error.message);
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    console.log(JSON.stringify(job.data));
    console.log(error);
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }

  private async createNewMeeting(event: any, userId: string): Promise<void> {
    const meetingPlatform = this.identifyMeetingType(event);

    const meeting = await Meeting.create({
      id: event?.iCalUID,
      meetingId: event?.id,
      platform: meetingPlatform,
      meetingType: event.recurrence
        ? MeetingTypeEnum.RECURRING
        : MeetingTypeEnum.NON_RECURRING,
      title: event?.summary ?? '',
      meetLink: this.getMeetingLink(meetingPlatform, event),
      startTime:
        new Date(event.start.dateTime).toISOString() ||
        new Date(event.start.date).toISOString(),
      endTime:
        new Date(event.end.dateTime).toISOString() ||
        new Date(event.end.date).toISOString(),
      timeZone: event?.start?.timeZone,
      userId: userId,
      status: MeetingStatusEnum.CREATED,
      rrule: this.getRRule(event),
    });

    if (event.attendees) {
      await this.createAttendees(
        {
          iCalUID: meeting.id,
          meetingId: meeting.meetingId,
          userId: meeting.userId,
        },
        event.attendees,
      );
    }

    if (event.recurrence) {
      await this.createRecurringMeeting(
        {
          iCalUID: meeting.id,
          meetingId: meeting.meetingId,
          userId: meeting.userId,
        },
        event,
      );
    }
  }

  private async updateMeeting(event: any, userId: string): Promise<void> {
    // Remove bot if time differs
    // await this.meetingService.removeCurrentBotIfTimeDiffers(
    //   { iCalUID: event.iCalUID, meetingId: event.id, userId },
    //   new Date(event.start.dateTime).toISOString(),
    // );

    const meetingPlatform = this.identifyMeetingType(event);

    await Meeting.update(
      {
        title: event?.summary ?? '',
        platform: meetingPlatform,
        meetLink: this.getMeetingLink(meetingPlatform, event),
        startTime:
          new Date(event.start.dateTime).toISOString() ||
          new Date(event.start.date).toISOString(),
        endTime:
          new Date(event.end.dateTime).toISOString() ||
          new Date(event.end.date).toISOString(),
        timeZone: event?.start?.timeZone,
        status: MeetingStatusEnum.CREATED,
        rrule: this.getRRule(event),
        meetingType: event.recurrence
          ? MeetingTypeEnum.RECURRING
          : MeetingTypeEnum.NON_RECURRING,
      },
      { where: { id: event.iCalUID, meetingId: event.id, userId } },
    );

    // Update attendees
    await MeetingAttendees.destroy({
      where: { meetingId: event.id, meetingICalUID: event.iCalUID, userId },
    });
    if (event.attendees) {
      await this.createAttendees(
        { iCalUID: event.iCalUID, meetingId: event.id, userId },
        event.attendees,
      );
    }

    // Update recurring meeting info
    await RecurringMeeting.destroy({
      where: { meetingId: event.id, meetingICalUID: event.iCalUID, userId },
    });
    if (event.recurrence) {
      await this.createRecurringMeeting(
        { iCalUID: event.iCalUID, meetingId: event.id, userId },
        event,
      );
    }
  }

  private async deleteMeeting(
    meetingId: string,
    userId: string,
  ): Promise<void> {
    const meeting = await Meeting.findOne({
      where: { meetingId: meetingId, userId },
    });
    if (!meeting) return;
    const where = {
      meetingId: meeting.meetingId,
      userId,
    };

    if (meeting) {
      console.log('deleting meeting', meeting);
      await MeetingAttendees.destroy({ where });
      await RecurringMeeting.destroy({ where });
      await meeting.destroy();
    }
  }

  private async createAttendees(
    {
      iCalUID,
      meetingId,
      userId,
    }: { iCalUID: string; meetingId: string; userId: string },
    attendees: any[],
  ): Promise<void> {
    const attendeesData = attendees.map((attendee) => ({
      meetingId: meetingId,
      meetingICalUID: iCalUID,
      userId,
      email: attendee.email,
      displayName: attendee.displayName || '',
    }));
    await MeetingAttendees.bulkCreate(attendeesData);
  }

  private async createRecurringMeeting(
    {
      iCalUID,
      meetingId,
      userId,
    }: { iCalUID: string; meetingId: string; userId: string },
    event: any,
  ): Promise<void> {
    // This is a simplified approach. Need to parse the RRULE for more complex recurrence patterns
    await RecurringMeeting.create({
      meetingICalUID: iCalUID,
      meetingId: meetingId,
      userId,
      startDate: event.start.dateTime || event.start.date,
      endDate: event.end.dateTime || event.end.date,
      startTime: event.start.dateTime
        ? new Date(event.start.dateTime).toTimeString()
        : '',
      endTime: event.end.dateTime
        ? new Date(event.end.dateTime).toTimeString()
        : '',
    });
  }

  private getRRule(event: any): string {
    if (Array.isArray(event.recurrence) && event.recurrence.length > 0) {
      const startDate = event?.start?.dateTime || event?.start?.date;
      const timeZone = event?.start?.timeZone;
      const rrule = event.recurrence.find((r) => r.includes('RRULE'));

      const extendedRRule = `DTSTART;TZID=${timeZone}:${moment(startDate)
        .tz(timeZone)
        .format('YYYYMMDDTHHmmss')};\n${rrule}`;

      return extendedRRule;
    } else {
      return '';
    }
  }

  private identifyMeetingType(event) {
    // Check for Google Meet
    if (event?.conferenceData?.entryPoints) {
      for (const entryPoint of event.conferenceData.entryPoints) {
        if (entryPoint.uri?.startsWith('https://meet.google.com/')) {
          return MeetingPlatformEnum.GOOGLE_MEET;
        }
      }
    }

    // Check for Zoom Meeting
    if (event?.description?.includes('Zoom')) {
      const zoomLinkRegex = /https?:\/\/(.*?\.)?zoom\.us\/j\/\d+/;
      if (zoomLinkRegex.test(event.description)) {
        return MeetingPlatformEnum.ZOOM;
      }
    }

    // Check for Microsoft Teams Meeting
    if (event?.description?.includes('Microsoft Teams')) {
      const teamsLinkRegex =
        /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/\S+/;
      if (teamsLinkRegex.test(event.description)) {
        return MeetingPlatformEnum.TEAMS;
      }
    }

    // If no match found
    return undefined;
  }

  private getMeetingLink(meetingType, event) {
    let meetingLink = '';

    // Check for Google Meet
    if (meetingType === MeetingPlatformEnum.GOOGLE_MEET) {
      if (event?.conferenceData?.entryPoints) {
        for (const entryPoint of event.conferenceData.entryPoints) {
          if (entryPoint.uri?.startsWith('https://meet.google.com/')) {
            meetingLink = entryPoint.uri;
            break;
          }
        }
      }
    }

    // Check for Zoom Meeting
    else if (meetingType === MeetingPlatformEnum.ZOOM) {
      // Check location for Zoom link
      if (!meetingLink && event?.location?.includes('zoom.us')) {
        meetingLink = event.location;
      }

      if (event?.description) {
        const zoomLinkRegex =
          /https:\/\/(zoom\.us|us\d+\.zoom\.us)\/j\/\d+(\?pwd=[\w-]+)?/;
        const match = event.description.match(zoomLinkRegex);
        if (match) {
          meetingLink = match[0];
        }
      }
    }

    // Check for Microsoft Teams Meeting
    else if (meetingType === MeetingPlatformEnum.TEAMS) {
      // Check location for Teams link
      if (!meetingLink && event?.location?.includes('teams.microsoft.com')) {
        meetingLink = event.location;
      }

      if (event?.description) {
        const teamsLinkRegex =
          /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/\+/;
        const match = event.description.match(teamsLinkRegex);
        if (match) {
          meetingLink = match[0];
        }
      }
    }

    return meetingLink;
  }
}

import { Injectable } from '@nestjs/common';
import { User, Meeting, ExecutionLog } from 'src/database/postgres/models';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { GoogleService } from 'src/providers/google/google.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  GOOGLE_CALENDAR_EVENT_PROCESSOR,
  GOOGLE_CALENDAR_PUSH_EVENTS,
} from 'src/constants/bull-queue';
import { ExecutionLogEnum } from 'src/database/postgres/models/execution-log.model';
import { CueMeetService } from 'src/providers/cuemeet/cuemeet.service';
import { MeetingStatusEnum } from 'src/utils/enums';

@Injectable()
export class CalendarEventsScheduler {
  constructor(
    private readonly googleService: GoogleService,
    @InjectQueue(GOOGLE_CALENDAR_EVENT_PROCESSOR)
    private readonly googleCalendarEventProcess: Queue,
    private readonly cueMeetService: CueMeetService,
  ) {}

  @Cron('0 */20 * * * *')
  async syncCalendarEvents() {
    console.log('Running periodic calendar events sync...');

    try {
      // Get all users with Google Calendar integration
      const users = await User.findAll({
        where: {
          googleAccessToken: { [Op.not]: null },
          googleRefreshToken: { [Op.not]: null },
        },
      });

      for (const user of users) {
        try {
          const { events, nextSyncToken } =
            await this.googleService.getGoogleCalendarEvents(
              user.id,
              {
                accessToken: user.googleAccessToken,
                refreshToken: user.googleRefreshToken,
              },
              user.googleCalendarSyncToken,
            );

          if (nextSyncToken) {
            await user.update({
              googleCalendarSyncToken: nextSyncToken,
            });
          }

          // Process the events through the queue
          await this.googleCalendarEventProcess.add(
            GOOGLE_CALENDAR_PUSH_EVENTS,
            {
              user: user,
              events: events,
            },
            {
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            },
          );

          console.log(`Synced ${events.length} events for user ${user.id}`);
        } catch (error) {
          console.error(`Error syncing events for user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in calendar sync cron job:', error);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async initializeMeetingBots() {
    console.log('Running periodic meeting bot initialization...');

    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 5 * 60000);

      // Get meetings scheduled in the next 10 minutes
      const upcomingMeetings = await Meeting.findAll({
        where: {
          startTime: {
            [Op.between]: [now.toISOString(), tenMinutesFromNow.toISOString()],
          },
          status: MeetingStatusEnum.CREATED,
          isRecordingEnabled: true,
        },
        include: [
          {
            model: User,
            required: true,
          },
        ],
      });

      console.log(
        `Found ${upcomingMeetings.length} upcoming meetings to initialize bots`,
      );

      for (const meeting of upcomingMeetings) {
        try {
          // Check if bot is already initialized
          const existingBot = await ExecutionLog.findOne({
            where: {
              meetingId: meeting.meetingId,
              meetingICalUID: meeting.id,
              userId: meeting.userId,
              status: {
                [Op.in]: [ExecutionLogEnum.PENDING, ExecutionLogEnum.RUNNING],
              },
            },
          });

          if (existingBot) {
            console.log(`Bot already initialized for meeting ${meeting.id}`);
            continue;
          }

          // Create bot using CueMeet service
          const meetingBot = await this.cueMeetService.createBot(
            meeting.user.cueMeetApiKey,
            `${meeting.user.name.split(' ')[0]} - CueCal Note Taker`,
            meeting.meetLink,
          );

          // Update meeting with bot ID
          await meeting.update({
            cuemeetBotId: meetingBot.id,
          });

          // Create execution log
          await ExecutionLog.create({
            userId: meeting.userId,
            botUsedId: meeting.user.cueMeetUserId,
            botId: meetingBot.id,
            meetingId: meeting.meetingId,
            meetingICalUID: meeting.id,
            status: ExecutionLogEnum.RUNNING,
          });

          console.log(`Successfully initialized bot for meeting ${meeting.id}`);
        } catch (error) {
          console.error(
            `Error initializing bot for meeting ${meeting.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error('Error in meeting bot initialization job:', error);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getMeetingTranscript() {
    console.log('Running periodic meeting transcript sync...');

    try {
      const runningBots = await ExecutionLog.findAll({
        where: {
          status: ExecutionLogEnum.RUNNING,
        },
        include: [
          {
            model: Meeting,
            as: 'meetingByICalUID',
            required: true,
          },
          {
            model: User,
            required: true,
          },
        ],
      });

      console.log(
        `Found ${runningBots.length} running bots to check for transcripts`,
      );

      // Track processed meetings to avoid duplicates
      const processedMeetings = new Set<string>();
      const MAX_RETRIES = 3; // 15 minutes of retries (5 minutes * 3)

      // Process bots in batches of 10 to avoid overwhelming the system
      const BATCH_SIZE = 10;
      for (let i = 0; i < runningBots.length; i += BATCH_SIZE) {
        const batch = runningBots.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (bot) => {
            try {
              // Skip if we've already processed this meeting
              if (processedMeetings.has(bot.meetingId)) {
                console.log(`Skipping duplicate meeting ${bot.meetingId}`);
                return;
              }
              processedMeetings.add(bot.meetingId);

              // Get the associated user and meeting
              const user = await User.findByPk(bot.userId);
              const meeting = bot.meetingByICalUID;

              if (!user || !meeting) {
                throw new Error('Associated user or meeting not found');
              }

              // First check bot status
              const botStatus = await this.cueMeetService.retrieveBot(
                user.cueMeetApiKey,
                bot.botId,
              );

              console.log(`Bot ${bot.botId} status:`, botStatus?.status);

              // Only proceed if bot is completed
              if (botStatus?.status === ExecutionLogEnum.COMPLETED) {
                const transcript = await this.cueMeetService.retrieveTranscript(
                  user.cueMeetApiKey,
                  bot.botId,
                );

                // Check if transcript exists and has content
                if (
                  transcript &&
                  transcript.transcript &&
                  transcript.transcript.length > 0
                ) {
                  // Update both meeting and execution log in a transaction
                  await Promise.all([
                    meeting.update({
                      hasTranscription: true,
                    }),
                    bot.update({
                      status: ExecutionLogEnum.COMPLETED,
                    }),
                  ]);

                  console.log(
                    `Successfully processed transcript for meeting ${bot.meetingId}`,
                  );
                } else {
                  console.log(
                    `No transcript content found for meeting ${bot.meetingId}`,
                  );

                  // Increment retry count and check if we should mark as failed
                  const retryCount = (bot.retryCount || 0) + 1;
                  if (retryCount >= MAX_RETRIES) {
                    await bot.update({
                      status: ExecutionLogEnum.FAILED,
                      retryCount,
                    });
                    console.log(
                      `Marked bot ${bot.botId} as failed after ${MAX_RETRIES} retries`,
                    );
                  } else {
                    await bot.update({ retryCount });
                  }
                }
              } else if (botStatus?.status === ExecutionLogEnum.FAILED) {
                // If bot reports failed status, update our record
                await bot.update({
                  status: ExecutionLogEnum.FAILED,
                });
                console.log(
                  `Bot ${bot.botId} reported failed status, updated record`,
                );
              } else {
                console.log(
                  `Bot ${bot.botId} is not completed yet. Current status: ${botStatus?.status}`,
                );
              }
            } catch (error) {
              console.error(
                `Error processing transcript for bot ${bot.id}:`,
                error.message,
              );

              // Update execution log to failed status if there's an error
              await bot.update({
                status: ExecutionLogEnum.FAILED,
              });
            }
          }),
        );
      }
    } catch (error) {
      console.error('Error in meeting transcript sync job:', error);
    }
  }
}

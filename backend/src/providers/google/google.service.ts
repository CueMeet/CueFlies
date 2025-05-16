import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GOOGLE_AUTH_CONFIG } from '../../constants/config';
import { calendar_v3, google } from 'googleapis';
import { User } from 'src/database/postgres/models';
import { GoogleCalendarUserObject } from './objects/google-calendar-user.object';
import { v4 as uuidv4 } from 'uuid';
import { GOOGLE_CALENDER_WEBHOOK_URL } from '../../constants/config';
import { GlobalResponse } from './objects/global';
import {
  GOOGLE_CALENDAR_EVENT_PROCESSOR,
  GOOGLE_CALENDAR_PUSH_EVENTS,
} from '../../constants/bull-queue';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  id_token: string;
  expiry_date: number;
}

@Injectable()
export class GoogleService {
  private readonly MAX_RETRIES = 3;

  constructor(
    @InjectQueue(GOOGLE_CALENDAR_EVENT_PROCESSOR)
    private readonly googleCalendarEventProcess: Queue,
  ) {}

  private getOAuth2Client() {
    return new google.auth.OAuth2(
      GOOGLE_AUTH_CONFIG.clientId,
      GOOGLE_AUTH_CONFIG.clientSecret,
      GOOGLE_AUTH_CONFIG.redirectUri,
    );
  }

  async getUserInfo(
    code: string,
  ): Promise<{ userInfo: GoogleUserPayload; tokens: GoogleTokens }> {
    try {
      // Exchange the authorization code for tokens
      const { tokens } = await this.getOAuth2Client().getToken(code);

      if (!tokens || !tokens.access_token) {
        throw new Error('Invalid Google account!');
      }

      // Create a new oauth2 client with explicit auth
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials(tokens);

      // Get user info using the OAuth2 client with explicit auth
      const oauth2 = google.oauth2({
        version: 'v2',
        auth: oauth2Client,
      });

      const response = await oauth2.userinfo.get();
      const data = response.data;

      if (!data.email || !data.name) {
        throw new Error('Invalid Google account!');
      }

      const userInfo: GoogleUserPayload = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        email_verified: data.verified_email || false,
        sub: data.id!,
      };

      return {
        userInfo,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope!,
          id_token: tokens.id_token!,
          expiry_date: tokens.expiry_date!,
        },
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Invalid Google account!');
    }
  }

  private async handleTokenRefresh(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    try {
      const userAuth = this.getOAuth2Client();
      userAuth.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await userAuth.refreshAccessToken();

      await User.update(
        { googleAccessToken: credentials.access_token },
        { where: { id: userId } },
      );

      return credentials.access_token;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  private async executeWithTokenRefresh<T>(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    operation: (calendar: calendar_v3.Calendar) => Promise<T>,
    retryCount = 0,
  ): Promise<T> {
    try {
      const calendar = this.getCalendar(tokens);

      return await operation(calendar);
    } catch (error) {
      if (error?.status === 401 && retryCount < this.MAX_RETRIES) {
        // Token expired, refresh and retry
        const newAccessToken = await this.handleTokenRefresh(
          userId,
          tokens.refreshToken,
        );

        return this.executeWithTokenRefresh(
          userId,
          { ...tokens, accessToken: newAccessToken },
          operation,
          retryCount + 1,
        );
      }
      throw error;
    }
  }

  private getCalendar(tokens: {
    accessToken: string;
    refreshToken: string;
  }): calendar_v3.Calendar {
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new BadRequestException('Invalid Google Calendar tokens');
    }

    const userAuth = this.getOAuth2Client();
    userAuth.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: userAuth });
  }

  public async getGoogleCalendarUser(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
  ): Promise<GoogleCalendarUserObject> {
    return this.executeWithTokenRefresh(userId, tokens, async (calendar) => {
      const response = await calendar.calendarList.get({
        calendarId: 'primary',
      });

      if (!response?.data) {
        throw new NotFoundException('Calendar user not found');
      }

      return {
        email: response.data.id,
        displayName: response.data.summary,
      };
    });
  }

  public async getGoogleCalendarEvents(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    syncToken?: string,
  ): Promise<{ events: calendar_v3.Schema$Event[]; nextSyncToken?: string }> {
    return this.executeWithTokenRefresh(userId, tokens, async (calendar) => {
      try {
        const params: calendar_v3.Params$Resource$Events$List = {
          calendarId: 'primary',
          singleEvents: true,
          maxResults: 20,
          timeMin: new Date().toISOString(),
          timeMax: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          orderBy: 'startTime',
        };

        if (syncToken) {
          delete params.timeMin;
          delete params.timeMax;
          params.syncToken = syncToken;
        }

        const response = await calendar.events.list(params);

        return {
          events: response.data.items || [],
          nextSyncToken: response.data.nextSyncToken || '',
        };
      } catch (error) {
        if (error?.response?.status === 410) {
          console.log('Sync token expired, performing full sync');
          const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            timeMax: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            singleEvents: true,
            maxResults: 20,
            orderBy: 'startTime',
          });

          return {
            events: response.data.items || [],
            nextSyncToken: response.data.nextSyncToken || '',
          };
        }
        throw error;
      }
    });
  }

  public async watchEvents(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
  ): Promise<calendar_v3.Schema$Channel> {
    return this.executeWithTokenRefresh(userId, tokens, async (calendar) => {
      const channelId = uuidv4();
      const response = await calendar.events.watch({
        calendarId: 'primary',
        requestBody: {
          id: channelId,
          type: 'web_hook',
          address: GOOGLE_CALENDER_WEBHOOK_URL,
        },
      });

      await User.update(
        {
          googleCalendarChannelId: channelId,
          googleCalendarResourceId: response.data.resourceId,
        },
        { where: { id: userId } },
      );

      return response.data;
    });
  }

  public async stopWatchEvents(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    channelId: string,
    resourceId: string,
  ): Promise<void> {
    await this.executeWithTokenRefresh(userId, tokens, async (calendar) => {
      await calendar.channels.stop({
        requestBody: {
          id: channelId,
          resourceId: resourceId,
        },
      });

      await User.update(
        {
          googleCalendarChannelId: null,
          googleCalendarResourceId: null,
        },
        { where: { id: userId } },
      );
    });
  }

  public async getCalendarUserTokens(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new BadRequestException('Invalid authorization code');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new BadRequestException('Failed to obtain tokens');
    }
  }

  public async handleGoogleCalenderWebhookNotification(
    body: any,
    headers: Record<string, string>,
  ): Promise<GlobalResponse> {
    const channelId = headers['x-goog-channel-id'];
    const resourceId = headers['x-goog-resource-id'];

    if (!channelId || !resourceId) {
      throw new BadRequestException('Invalid webhook headers');
    }

    try {
      const user = await User.findOne({
        where: {
          googleCalendarChannelId: channelId,
          googleCalendarResourceId: resourceId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found for the given channel');
      }

      return this.executeWithTokenRefresh(
        user.id,
        {
          accessToken: user.googleAccessToken,
          refreshToken: user.googleRefreshToken,
        },
        async () => {
          const { events, nextSyncToken } = await this.getGoogleCalendarEvents(
            user.id,
            {
              accessToken: user.googleAccessToken,
              refreshToken: user.googleRefreshToken,
            },
            user.googleCalendarSyncToken,
          );

          if (nextSyncToken) {
            await User.update(
              { googleCalendarSyncToken: nextSyncToken },
              { where: { id: user.id } },
            );
          }

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

          return {
            status: 200,
            message: 'Calendar event is being processed.',
          };
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to process webhook notification');
    }
  }
}

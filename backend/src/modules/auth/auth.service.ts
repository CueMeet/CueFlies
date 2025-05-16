import { Injectable } from '@nestjs/common';
import { GoogleService } from '../../providers/google/google.service';
import { User } from 'src/database/postgres/models';
import { JwtAuthService } from '../../providers/jwt/jwt.service';
import { Response } from 'express';
import { IS_PRODUCTION } from 'src/constants/config';
import { CalendarService } from '../calendar/calendar.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  GOOGLE_CALENDAR_EVENT_PROCESSOR,
  GOOGLE_CALENDAR_PUSH_EVENTS,
} from '../../constants/bull-queue';
import { CueMeetService } from '../../providers/cuemeet/cuemeet.service';
@Injectable()
export class AuthService {
  constructor(
    private googleService: GoogleService,
    private jwtService: JwtAuthService,
    private calendarService: CalendarService,
    @InjectQueue(GOOGLE_CALENDAR_EVENT_PROCESSOR)
    private readonly googleCalendarEventProcess: Queue,
    private cueMeetService: CueMeetService,
  ) {}

  async loginWithGoogle(token: string, res: Response) {
    const { userInfo, tokens } = await this.googleService.getUserInfo(token);

    let user = await User.findOne({
      where: { email: userInfo.email.toLowerCase() },
    });

    if (!user) {
      user = await User.create({
        email: userInfo.email.toLowerCase(),
        name: userInfo.name,
        avatar: userInfo.picture,
        sub: userInfo.sub,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: new Date(tokens.expiry_date),
      });

      const cuemeetUser = await this.cueMeetService.createUser(
        userInfo.email,
        userInfo.name,
      );

      await user.update(
        {
          cueMeetUserId: cuemeetUser.id,
          cueMeetApiKey: cuemeetUser.apiKey,
        },
        { where: { id: user.id } },
      );

      // For new users, fetch and store upcoming events
      const { events: upcomingEvents, nextSyncToken } =
        await this.googleService.getGoogleCalendarEvents(user.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });

      if (upcomingEvents.length > 0) {
        await this.googleCalendarEventProcess.add(
          GOOGLE_CALENDAR_PUSH_EVENTS,
          {
            user: user,
            events: upcomingEvents,
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
      }

      // Store the sync token for future syncs
      if (nextSyncToken) {
        await user.update({
          googleCalendarSyncToken: nextSyncToken,
        });
      }
    } else {
      await user.update({
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: new Date(tokens.expiry_date),
      });
    }

    const channel = await this.googleService.watchEvents(user.id, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    await User.update(
      {
        googleCalendarChannelId: channel.id,
        googleCalendarResourceId: channel.resourceId,
      },
      { where: { id: user.id } },
    );

    const { accessToken, refreshToken } = await this.jwtService.generateTokens(
      user.id,
      user.email,
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken,
      user,
    };
  }

  async logout(res: Response) {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    });

    return { success: true };
  }

  async refreshTokens(refreshToken: string, res: Response) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.jwtService.generateTokens(payload.sub, payload.email);

    // Update refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }
}

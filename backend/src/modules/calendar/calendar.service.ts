import { Injectable } from '@nestjs/common';
import { GoogleService } from '../../providers/google/google.service';

@Injectable()
export class CalendarService {
  constructor(private readonly googleService: GoogleService) {}

  async handleWebhookNotification(body: any, headers: Record<string, string>) {
    await this.googleService.handleGoogleCalenderWebhookNotification(
      body,
      headers,
    );

    return { status: 'success' };
  }
}

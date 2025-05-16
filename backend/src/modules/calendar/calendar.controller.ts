import { Controller, Post, Body, Headers } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
    console.log('Google calendar webhook received a event.');
    // await this.calendarService.handleWebhookNotification(body, headers);
    return { success: true };
  }
}

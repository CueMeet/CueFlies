import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { GoogleService } from './google.service';
import { GoogleCalenderProcessor } from './processor/google-calendar.processor';
import { GOOGLE_CALENDAR_EVENT_PROCESSOR } from '../../constants/bull-queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: GOOGLE_CALENDAR_EVENT_PROCESSOR,
    }),
  ],
  providers: [GoogleService, GoogleCalenderProcessor],
  exports: [GoogleService, BullModule],
})
export class GoogleModule {}

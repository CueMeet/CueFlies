import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GoogleModule } from '../../providers/google/google.module';
import { CalendarModule } from '../calendar/calendar.module';
import { AuthGuard } from '../../guards/auth.guard';
import { BullModule } from '@nestjs/bull';
import { GOOGLE_CALENDAR_EVENT_PROCESSOR } from '../../constants/bull-queue';
import { CueMeetModule } from '../../providers/cuemeet/cuemeet.module';

@Module({
  imports: [
    GoogleModule,
    CalendarModule,
    BullModule.registerQueue({
      name: GOOGLE_CALENDAR_EVENT_PROCESSOR,
    }),
    CueMeetModule,
  ],
  providers: [AuthResolver, AuthService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { GoogleModule } from '../../providers/google/google.module';
import { CalendarEventsScheduler } from '../../schedulers/getCalanderEventsScheduler';
import { CueMeetModule } from '../../providers/cuemeet/cuemeet.module';

@Module({
  imports: [GoogleModule, CueMeetModule],
  providers: [CalendarService, CalendarEventsScheduler],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}

import { Module } from '@nestjs/common';
import { MeetingResolver } from './meeting.resolver';
import { MeetingService } from './meeting.service';
import { CueMeetModule } from 'src/providers/cuemeet/cuemeet.module';

@Module({
  imports: [CueMeetModule],
  providers: [MeetingResolver, MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}

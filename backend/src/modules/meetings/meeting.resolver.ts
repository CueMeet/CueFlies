import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import {
  GetMeetingsOptionsInput,
  InitializeMeetingBotInput,
} from './input/get-meetings-options.input';
import {
  InitializeMeetingBotOutput,
  MeetingOutput,
  MeetingsPaginated,
} from './output/meeting-paginated.object';
import { MeetingService } from './meeting.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/database/postgres/models';
import { AuthGuard } from 'src/guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(AuthGuard)
export class MeetingResolver {
  constructor(private readonly meetingService: MeetingService) {}

  @Query(() => [MeetingsPaginated])
  async getMeetings(
    @Args('options')
    options: GetMeetingsOptionsInput,
    @CurrentUser() user: User,
  ) {
    return this.meetingService.getMeetings(user, options);
  }

  @Mutation(() => InitializeMeetingBotOutput)
  async initializeMeetingBot(
    @Args('options') options: InitializeMeetingBotInput,
    @CurrentUser() user: User,
  ) {
    return this.meetingService.initializeMeetingBot(user, options);
  }

  @Query(() => MeetingOutput)
  async getMeetingTranscript(
    @Args('meetingId')
    meetingId: string,
    @CurrentUser() user: User,
  ): Promise<MeetingOutput> {
    return this.meetingService.getMeetingTranscript(meetingId, user);
  }
}

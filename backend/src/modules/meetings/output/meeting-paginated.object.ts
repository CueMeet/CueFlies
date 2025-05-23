import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Meeting, MeetingAttendees } from '../../../database/postgres/models';

@ObjectType()
class MeetingTranscriptSegment {
  @Field(() => String)
  id: string;

  @Field(() => String)
  speaker: string;

  @Field(() => String)
  transcription_start_time_milliseconds: string;

  @Field(() => String)
  transcription_end_time_milliseconds: string;

  @Field(() => String)
  transcription_Data: string;
}

@ObjectType()
class TranscriptPagination {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType()
export class MeetingsPaginated {
  @Field(() => Meeting)
  meeting: Meeting;

  @Field(() => [MeetingAttendees])
  attendees: MeetingAttendees[];

  @Field(() => Boolean)
  isRecorded?: boolean;

  @Field(() => Boolean)
  isBotLive?: boolean;
}

@ObjectType()
export class InitializeMeetingBotOutput {
  @Field(() => Boolean)
  status: boolean;

  @Field(() => String)
  meetingId: string;
}

@ObjectType()
export class MeetingOutput {
  @Field(() => Meeting)
  meeting: Meeting;

  @Field(() => [MeetingAttendees])
  attendees: MeetingAttendees[];

  @Field(() => [MeetingTranscriptSegment], { nullable: true })
  transcript: MeetingTranscriptSegment[];

  @Field(() => TranscriptPagination, { nullable: true })
  transcriptPagination: TranscriptPagination;
}

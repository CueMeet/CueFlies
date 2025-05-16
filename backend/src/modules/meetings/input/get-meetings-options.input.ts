import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetMeetingsOptionsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  date?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  tz?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

@InputType()
export class InitializeMeetingBotInput {
  @Field(() => String)
  @IsString()
  meetingUrl: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}

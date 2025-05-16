import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Model,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';

import {
  MeetingPlatformEnum,
  MeetingStatusEnum,
  MeetingTypeEnum,
} from '../../../utils/enums';

@ObjectType()
@Table({
  tableName: 'meetings',
})
export class Meeting extends Model<Meeting> {
  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string; // iCalUID

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  meetingId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Field(() => MeetingPlatformEnum, { nullable: true })
  @Column({
    type: DataType.ENUM(...Object.values(MeetingPlatformEnum)),
    allowNull: true,
  })
  platform: MeetingPlatformEnum;

  @Field(() => MeetingTypeEnum, { nullable: false })
  @Column({
    type: DataType.ENUM(...Object.values(MeetingTypeEnum)),
    allowNull: false,
  })
  meetingType: MeetingTypeEnum;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: '',
  })
  meetLink: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  startTime: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  endTime: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  timeZone: string;

  @Field(() => MeetingStatusEnum, { nullable: false })
  @Column({
    type: DataType.ENUM(...Object.values(MeetingStatusEnum)),
    allowNull: false,
  })
  status: MeetingStatusEnum;

  @Field(() => Boolean, { nullable: false })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isRecordingEnabled: boolean;

  @Field(() => Boolean, { nullable: false })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  hasTranscription: boolean;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rrule: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cuemeetBotId: string;

  @Field()
  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Field()
  @Column({ type: DataType.DATE })
  updatedAt: Date;
}

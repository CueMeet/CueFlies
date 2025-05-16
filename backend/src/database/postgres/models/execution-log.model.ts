import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Model,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Meeting } from './meeting.model';
import { User } from './user.model';

interface CreateExecutionLogAttributes {
  id?: string;
  taskId?: string;
  retryCount?: number;
  userId: string;
  botUsedId?: string;
  botId?: string;
  meetingTimeZone?: string;
  meetingId?: string;
  meetingICalUID?: string;
  status?: string;
}

export enum MeetingBotTypeEnum {
  GOOGLE = 0,
  MS_TEAMS = 1,
  ZOOM = 2,
}

export enum ExecutionLogEnum {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

@ObjectType()
@Table({ tableName: 'executionLogs' })
export class ExecutionLog extends Model<
  ExecutionLog,
  CreateExecutionLogAttributes
> {
  @Field()
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  @Index({ unique: true })
  id: string;

  @Column({
    allowNull: true,
  })
  taskId: string;

  @Column({
    allowNull: true,
  })
  retryCount: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    allowNull: true,
  })
  botUsedId: string;

  @Column({
    allowNull: true,
  })
  botId: string;

  @Column({
    allowNull: true,
  })
  meetingTimeZone: string;

  @ForeignKey(() => Meeting)
  @Column({
    allowNull: true,
  })
  meetingId: string;

  @ForeignKey(() => Meeting)
  @Column({
    allowNull: true,
  })
  meetingICalUID: string;

  @Column({
    allowNull: true,
  })
  status: string;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;

  @BelongsTo(() => Meeting, { foreignKey: 'meetingId' })
  meeting: Meeting;

  @BelongsTo(() => Meeting, { foreignKey: 'meetingICalUID' })
  meetingByICalUID: Meeting;

  @BelongsTo(() => User)
  user: User;
}

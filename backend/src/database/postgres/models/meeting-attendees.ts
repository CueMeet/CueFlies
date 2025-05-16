import { Field, ObjectType } from '@nestjs/graphql';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@ObjectType()
@Table({
  tableName: 'meetingAttendees',
})
export class MeetingAttendees extends Model<MeetingAttendees> {
  @Field()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING, allowNull: true })
  meetingId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING, allowNull: true })
  meetingICalUID: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  userId: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  displayName: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

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
}

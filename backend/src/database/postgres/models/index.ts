import { User } from './user.model';
import { Meeting } from './meeting.model';
import { MeetingAttendees } from './meeting-attendees';
import { RecurringMeeting } from './recurring-meeting.model';
import { ExecutionLog } from './execution-log.model';

export const Models = [
  User,
  Meeting,
  MeetingAttendees,
  RecurringMeeting,
  ExecutionLog,
];

export { User, Meeting, MeetingAttendees, RecurringMeeting, ExecutionLog };

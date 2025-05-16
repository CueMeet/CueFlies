import { rrulestr } from 'rrule';
import { DateTime } from 'luxon';
import * as moment from 'moment-timezone';

export const CLIENT_DATE_FORMAT = 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)';

export const getOccurrences = (date: string, tz: string, rrule: string) => {
  const rule = rrulestr(rrule);
  const dateStartTime = moment(date, CLIENT_DATE_FORMAT)
    .tz(tz)
    .startOf('week')
    .toDate();
  const dateEndTime = moment(date, CLIENT_DATE_FORMAT)
    .tz(tz)
    .endOf('week')
    .toDate();
  const occurrences = rule.between(dateStartTime, dateEndTime);

  return occurrences.map((date) =>
    DateTime.fromJSDate(date)
      .toUTC()
      .setZone('local', { keepLocalTime: true })
      .toJSDate(),
  );
};

import { useRouter } from 'next/router';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { GET_MEETINGS } from '@/graphql/meetings';
import { formatDateForAPI } from '@/utils/helpers';
import { MeetingPlatformEnum } from '@/utils/enum';

interface Meeting {
  id: string;
  meetingId: string;
  title: string;
  meetLink: string;
  startTime: string;
  endTime: string;
  isRecordingEnabled: boolean;
  hasTranscription: boolean;
  platform: MeetingPlatformEnum | null;
}

interface MeetingData {
  meeting: Meeting;
  attendees: {
    id: string;
    email: string;
    name: string;
  }[];
  isRecorded: boolean;
  isBotLive: boolean;
}

interface EventsListProps {
  selectedDate: Date;
}

const EventsList = ({ selectedDate }: EventsListProps) => {
  const router = useRouter();

  const { data, loading } = useQuery(GET_MEETINGS, {
    variables: {
      options: {
        date: formatDateForAPI(selectedDate),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
  });

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getEventIcon = (platform: MeetingPlatformEnum | null) => {
    switch (platform) {
      case MeetingPlatformEnum.GOOGLE_MEET:
        return (
          <div>
            <Image src="/svgs/google-meet.svg" alt="Google Meet" width={36} height={36} />
          </div>
        );
      case MeetingPlatformEnum.ZOOM:
        return (
          <div>
            <Image src="/svgs/zoom.svg" alt="Zoom" width={36} height={36} />
          </div>
        );
      case MeetingPlatformEnum.TEAMS:
        return (
          <div>
            <Image src="/svgs/microsoft-teams.svg" alt="Microsoft Teams" width={36} height={36} />
          </div>
        );
      default:
        return (
          <div>
            <Image src="/svgs/google-calendar.svg" alt="Calendar" width={36} height={36} />
          </div>
        );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const meetings = data?.getMeetings || [];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Events for {formatDate(selectedDate)}
      </h3>
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No events scheduled for this day</p>
          </div>
        ) : (
          meetings.map(({ meeting }: MeetingData) => (
            <div
              key={meeting.id}
              onClick={() => handleEventClick(meeting.id)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getEventIcon(meeting.platform)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors duration-200">
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {meeting.hasTranscription && (
                    <div
                      className="text-green-600 p-2 text-sm rounded-md bg-green-50 transition-colors duration-200"
                      title="Meeting has transcript"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Transcript
                    </div>
                  )}
                  {meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 p-2 rounded-md hover:bg-primary/10 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Join meeting"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsList; 
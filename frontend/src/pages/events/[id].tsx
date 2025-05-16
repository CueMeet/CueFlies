import { useState } from 'react';
import { useRouter } from 'next/router';
import DefaultLayout from '../../components/layouts';
import TranscriptView from '../../components/events/TranscriptView';
import { GET_MEETING_TRANSCRIPT } from '../../graphql/meetings';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import { MeetingPlatformEnum } from '@/utils/enum';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

type TabType = 'overview' | 'transcript' | 'action-items';

interface Attendee {
  email: string;
}

interface TranscriptMessage {
  id: string;
  speaker: string;
  transcription_Data: string;
  transcription_end_time_milliseconds: string;
  transcription_start_time_milliseconds: string;
}

const EventOverviewPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, loading } = useQuery(GET_MEETING_TRANSCRIPT, {
    variables: {
      meetingId: router.query.id
    }
  });

  const meeting = data?.getMeetingTranscript?.meeting;

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const getPlatformIcon = (platform: MeetingPlatformEnum | null) => {
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

  const transformTranscriptData = (transcript: TranscriptMessage[]) => {
    return transcript.map((message) => {
      // Extract initials from speaker name or use first letter of transcription
      const initials = message.speaker === 'Unknown Speaker' 
        ? message.transcription_Data.charAt(0).toUpperCase()
        : message.speaker.split(' ').map(n => n[0]).join('').toUpperCase();

      // Format timestamp to show only minutes and seconds
      const timestamp = message.transcription_start_time_milliseconds
        .split('.')[0] // Remove milliseconds
        .replace('00:', ''); // Remove hours if 00

      return {
        speaker: {
          name: message.speaker,
          initials: initials
        },
        timestamp: timestamp,
        content: message.transcription_Data
      };
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="p-6">
          <p className="text-gray-500 text-center">Loading meeting details...</p>
        </div>
      );
    }

    if (!meeting) {
      return (
        <div className="p-6">
          <p className="text-gray-500 text-center">Meeting not found</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'transcript':
        if (!data?.getMeetingTranscript?.transcript) {
          return (
            <div className="p-6">
              <p className="text-gray-500 text-center">No transcript available for this meeting</p>
            </div>
          );
        }
        return <TranscriptView messages={transformTranscriptData(data.getMeetingTranscript.transcript)} />;
      case 'action-items':
        return (
          <div className="p-6">
            <p className="text-gray-500 text-center">Action items coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title</span>
                    <p className="text-gray-900">{meeting.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Time</span>
                    <p className="text-gray-900">{formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">End Time</span>
                    <p className="text-gray-900">{formatDate(meeting.endTime)} at {formatTime(meeting.endTime)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Platform</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPlatformIcon(meeting.platform as MeetingPlatformEnum)}
                      <p className="text-gray-900">{meeting.platform.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {data?.getMeetingTranscript?.attendees?.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
                  <div className="space-y-4">
                    {data.getMeetingTranscript.attendees.map((participant: Attendee, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {participant.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
                  <p className="text-gray-500">No participants data available</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <DefaultLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary/80 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{meeting?.title || 'Loading...'}</h1>
                {/* <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary">
                  Export
                </button> */}
              </div>
              {meeting && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{formatDate(meeting.startTime)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatTime(meeting.startTime)}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(meeting.platform as MeetingPlatformEnum)}
                    <span>{meeting.platform.replace('_', ' ')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'transcript'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Transcript
                </button>
              </nav>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </DefaultLayout>
    </ProtectedRoute>
  );
};

export default EventOverviewPage; 
import { gql } from "@apollo/client";

export const GET_MEETINGS = gql`
  query GetMeetings($options: GetMeetingsOptionsInput!) {
    getMeetings(options: $options) {
      meeting {
        id
        meetingId
        title
        meetLink
        startTime
        endTime
        isRecordingEnabled
        platform
        hasTranscription
        status
      }
      attendees {
        id
        email
        displayName
      }
      isRecorded
      isBotLive
    }
  }
`;

export const INITIALIZE_MEETING_BOT = gql`
  mutation initializeMeetingBot($options: InitializeMeetingBotInput!) {
    initializeMeetingBot(options: $options) {
      meetingId
      status
    }
  }
`;

export const GET_MEETING_TRANSCRIPT = gql`
  query getMeetingTranscript($meetingId: String!) {
    getMeetingTranscript(meetingId: $meetingId) {
      transcript {
        id
        speaker
        transcription_Data
        transcription_end_time_milliseconds
        transcription_start_time_milliseconds
      }
    meeting {
        id
        meetingId
        title
        meetLink
        startTime
        endTime
        isRecordingEnabled
        platform
        hasTranscription
      }
      attendees {
        id
        email
        displayName
      }
    }
  }
`;
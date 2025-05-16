import { Calendar, Video, FileStack, ChartBar } from 'lucide-react';

export const features = [
  {
    name: 'Calendar Integration',
    description: 'Seamlessly connect with Google Calendar to automatically track and join your meetings.',
    icon: Calendar,
  },
  {
    name: 'Multi-Platform Support',
    description: 'Works with Google Meet, Microsoft Teams, and Zoom meetings.',
    icon: Video,
  },
  {
    name: 'Smart Notes',
    description: 'Automatically generated meeting summaries, transcriptions, and action items.',
    icon: FileStack,
  },
  {
    name: 'Analytics',
    description: 'Track meeting participation and engagement metrics.',
    icon: ChartBar,
  },
];

export const steps = [
  {
    number: '1',
    title: 'Connect Your Calendar',
    description: 'Sign in with Google and grant calendar access to automatically sync your meetings.',
  },
  {
    number: '2',
    title: 'Join Meetings Automatically',
    description: 'Our bot joins your meetings and starts recording when they begin.',
  },
  {
    number: '3',
    title: 'Get Meeting Insights',
    description: 'Access detailed meeting notes, transcriptions, and analytics after each meeting.',
  },
];
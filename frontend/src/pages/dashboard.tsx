import { useState } from 'react';
import DefaultLayout from '../components/layouts';
import EventCalendar from '../components/dashboard/EventCalendar';
import EventsList from '../components/dashboard/EventsList';
// import CalendarConnection from '../components/dashboard/CalendarConnection';
import MeetingBotPopup from '../components/dashboard/MeetingBotPopup';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@apollo/client';
import { INITIALIZE_MEETING_BOT } from '../graphql/meetings';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMeetingBotPopupOpen, setIsMeetingBotPopupOpen] = useState(false);

  const [initializeMeetingBot, { loading }] = useMutation(INITIALIZE_MEETING_BOT);

  const handleInitializeBot = (meetingUrl: string, meetingName?: string) => {
    initializeMeetingBot({
      variables: {
        options: {
          meetingUrl: meetingUrl,
          name: meetingName
        }
      },
      onCompleted: () => {
        toast.success('Meeting bot initialized');
        setIsMeetingBotPopupOpen(false);
      },
      onError: (error) => {
        console.error('Error initializing meeting bot:', error);
      }
    });
  };
  
  return (
    <ProtectedRoute>
      <DefaultLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hey, { user?.name?.split(' ')[0] || '' }!</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your calendar and view upcoming meetings.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={() => setIsMeetingBotPopupOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Add to live meeting
              </button>
              {/* <CalendarConnection isConnected={true} email={user?.email || ''} /> */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Events List */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 to-purple-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <EventsList selectedDate={selectedDate} />
              </div>
            </div>

            {/* Right Column - Calendar View */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <EventCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
            </div>
          </div>

          <MeetingBotPopup
            isOpen={isMeetingBotPopupOpen}
            onClose={() => setIsMeetingBotPopupOpen(false)}
            onSubmit={handleInitializeBot}
            loading={loading}
          />
        </div>
      </DefaultLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
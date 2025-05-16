import Image from 'next/image';

interface CalendarConnectionProps {
  isConnected: boolean;
  email: string;
}

const CalendarConnection = ({ isConnected, email }: CalendarConnectionProps) => {
  return (
    <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-2 px-3">
      <div className="flex items-center space-x-2">
        <div>
          <Image src="/svgs/google-calendar.svg" alt="Google Calendar" width={36} height={36} />
        </div>
        {isConnected && (
          <span className="text-sm text-gray-600">{email}</span>
        )}
      </div>
    </div>
  );
};

export default CalendarConnection;
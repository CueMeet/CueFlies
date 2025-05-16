interface Message {
  speaker: {
    name: string;
    initials: string;
  };
  timestamp: string;
  content: string;
}

interface TranscriptViewProps {
  messages: Message[];
}

const TranscriptView = ({ messages }: TranscriptViewProps) => {
  return (
    <div className="p-6">
      {/* <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transcript..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div> */}

      <div className="space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="flex space-x-4 border-b border-gray-200 pb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {message.speaker.initials}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {message.speaker.name}
                </span>
                <span className="text-sm text-gray-500">{message.timestamp}</span>
              </div>
              <p className="text-gray-600">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptView; 
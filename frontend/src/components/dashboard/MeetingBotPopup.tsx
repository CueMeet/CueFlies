import { useState } from 'react';
import { X } from 'lucide-react';

enum MeetingPlatformEnum {
  GOOGLE_MEET = 'GOOGLE_MEET',
  ZOOM = 'ZOOM',
  TEAMS = 'TEAMS'
}

interface MeetingBotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingUrl: string, meetingName?: string) => void;
  loading: boolean;
}

const MeetingBotPopup = ({ isOpen, onClose, onSubmit, loading }: MeetingBotPopupProps) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleClose = () => {
    setMeetingUrl('');
    setMeetingName('');
    setUrlError('');
    onClose();
  };

  const identifyMeetingPlatform = (meetingLink: string): MeetingPlatformEnum | undefined => {
    if (meetingLink.startsWith('https://meet.google.com/')) {
      return MeetingPlatformEnum.GOOGLE_MEET;
    } else if (/https?:\/\/(.*?\.)?zoom\.us\/j\/\d+/.test(meetingLink)) {
      return MeetingPlatformEnum.ZOOM;
    } else if (/https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/\S+/.test(meetingLink)) {
      return MeetingPlatformEnum.TEAMS;
    } else {
      return undefined;
    }
  };

  const validateMeetingUrl = (url: string): boolean => {
    const platform = identifyMeetingPlatform(url);
    if (!platform) {
      setUrlError('Please enter a valid Google Meet, Zoom, or Microsoft Teams meeting URL');
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateMeetingUrl(meetingUrl)) {
      onSubmit(meetingUrl, meetingName);
      onClose();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingUrl(e.target.value);
    if (urlError) {
      validateMeetingUrl(e.target.value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl max-w-md w-full p-8 mx-auto shadow-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Add to live meeting
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="meetingUrl"
                    required
                    value={meetingUrl}
                    onChange={handleUrlChange}
                    className={`block w-full px-4 py-3 rounded-lg border ${
                      urlError ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 ease-in-out`}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                {urlError && (
                  <p className="mt-2 text-sm text-red-500">{urlError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">Enter the URL of your active meeting (Google Meet, Zoom, or Microsoft Teams)</p>
              </div>

              <div>
                <label htmlFor="meetingName" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Name <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="meetingName"
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 ease-in-out"
                    placeholder="e.g. Team Standup"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Give your meeting a memorable name</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Initialize Bot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingBotPopup;
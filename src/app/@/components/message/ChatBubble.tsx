interface ChatBubbleProps {
  message: string;
  isSender?: boolean;
  avatar?: string;
  timestamp?: string;
  isRead?: boolean;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  isSenderOnline?: boolean;
  isSenderActive?: boolean;
}

export function ChatBubble({ 
  message, 
  isSender, 
  avatar, 
  timestamp, 
  isRead, 
  messageType = 'text',
  fileUrl,
  fileName,
  isSenderOnline
}: ChatBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    switch (messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={fileUrl || message} 
              alt="Image" 
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileUrl || message, '_blank')}
            />
            {message && message !== fileUrl && (
              <p className="text-sm">{message}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{fileName || 'File'}</p>
                <p className="text-xs text-gray-500">{message}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm">{message}</p>;
    }
  };

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      {!isSender && avatar && (
        <div className="relative mr-2 self-end">
          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          {(isSenderActive !== undefined || isSenderOnline !== undefined) && (
            <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isSenderActive ? 'bg-green-400' : isSenderOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          )}
        </div>
      )}
      
      <div className="max-w-xs">
        <div
          className={`px-4 py-2 rounded-xl text-sm ${
            isSender 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        {/* Timestamp and read status */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isSender ? 'justify-end' : 'justify-start'
        }`}>
          {timestamp && (
            <span>{formatTime(timestamp)}</span>
          )}
          
          {isSender && (
            <div className="flex items-center gap-1">
              {isRead ? (
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  
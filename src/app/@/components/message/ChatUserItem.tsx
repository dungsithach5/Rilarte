import React from 'react';

interface ChatUserItemProps {
  name: string;
  message: string;
  time: string;
  avatar: string | null;
  unreadCount?: number;
  isOnline?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  isTyping?: boolean;
}

export function ChatUserItem({ 
  name, 
  message, 
  time, 
  avatar, 
  unreadCount = 0,
  isOnline = false,
  isActive = false,
  lastSeen,
  isTyping = false
}: ChatUserItemProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100">
      <div className="relative">
        {avatar ? (
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-lg">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Online status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isActive ? 'bg-green-400' : isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        {/* Status text */}
        {(isActive || isOnline) && (
          <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
            isActive ? 'bg-green-400' : 'bg-green-500'
          }`}>
            {isActive ? 'Active' : 'Online'}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-gray-900 truncate">{name}</h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isTyping && (
              <span className="text-xs text-blue-600 animate-pulse">typing...</span>
            )}
            <span className="text-xs text-gray-500">{formatTime(time)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            {isTyping ? 'typing...' : message}
          </p>
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full min-w-[20px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </div>
        
        {/* Last seen info */}
        {lastSeen && !isOnline && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <p className="text-xs text-gray-400">
              Last seen {formatTime(lastSeen)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
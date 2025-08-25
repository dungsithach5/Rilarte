import React from 'react';
import { MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  avatar: string | null;
  isOnline?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
}

export function ChatHeader({ 
  name, 
  avatar, 
  isOnline = false, 
  isActive = false,
  lastSeen,
  onCall,
  onVideoCall,
  onSearch,
  onMore
}: ChatHeaderProps) {
  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
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
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
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
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isActive ? 'bg-green-400' : isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {/* Status text */}
          {(isActive || isOnline) && (
            <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
              isActive ? 'bg-green-400' : 'bg-green-500'
            }`}>
              {isActive ? 'Active' : 'Online'}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className={`text-sm ${isActive ? 'text-green-600' : isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isActive ? 'Active' : isOnline ? 'Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {onSearch && (
          <button
            onClick={onSearch}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
        )}
        
        {onCall && (
          <button
            onClick={onCall}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Phone size={20} />
          </button>
        )}
        
        {onVideoCall && (
          <button
            onClick={onVideoCall}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Video size={20} />
          </button>
        )}
        
        {onMore && (
          <button
            onClick={onMore}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

"use client"

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface UserInfoProps {
  userId?: number;
  username?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function UserInfo({ 
  userId, 
  username, 
  avatar, 
  size = 'md',
  showName = true,
  className = '',
  onClick
}: UserInfoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const profileLink = userId ? `/profile/${userId}` : '/profile';
  const displayName = username || 'Unknown User';
  const displayAvatar = avatar || '/img/user.png';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link 
      href={profileLink}
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
      onClick={handleClick}
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={displayAvatar} alt={displayName} />
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      {showName && (
        <span className={`font-medium text-white ${textSizeClasses[size]}`}>
          {displayName}
        </span>
      )}
    </Link>
  );
} 
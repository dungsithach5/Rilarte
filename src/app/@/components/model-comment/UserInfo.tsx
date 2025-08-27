"use client"

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState, useEffect } from 'react';

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
  const [userInfo, setUserInfo] = useState<{username: string, avatar: string} | null>(null);
  const [loading, setLoading] = useState(false);
  // Fetch user info from userId
  useEffect(() => {
    if (userId && !userInfo) {
      setLoading(true);
      fetch(`http://localhost:5001/api/users/public/${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.user) {
            setUserInfo({
              username: data.user.name || data.user.username || `User ${userId}`,
              avatar: data.user.avatar || '/img/user.png'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, userInfo]);

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
  
  // Ưu tiên userInfo từ API, fallback về props
  const displayName = userInfo?.username || username || 'Unknown User';
  const displayAvatar = userInfo?.avatar || avatar || '/img/user.png';

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
"use client"

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MessageButtonProps {
  userId: bigint;
  username: string;
  onMessageClick: (userId: bigint, username: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function MessageButton({
  userId,
  username,
  onMessageClick,
  className = '',
  size = 'md',
  variant = 'default'
}: MessageButtonProps) {
  const handleClick = () => {
    onMessageClick(userId, username);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: '',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    default: 'border px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors hover:bg-black',
    outline: 'border px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors hover:bg-black',
    ghost: 'border px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors hover:bg-black'
  };

  return (
    <button
      onClick={handleClick}
      disabled={false}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        inline-flex items-center gap-2 rounded-full font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
      `}
      style={{ pointerEvents: 'auto' }}
    >
      <MessageCircle size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      Message
    </button>
  );
} 
import React from 'react';

interface ChatHeaderProps {
  name: string;
  avatar: string;
}

export function ChatHeader({ name, avatar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
        <span className="font-medium text-lg">{name}</span>
      </div>
    </div>
  );
}

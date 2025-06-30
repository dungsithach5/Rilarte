import React from 'react';

interface ChatHeaderProps {
  name: string;
  avatar: string;
}

export function ChatHeader({ name, avatar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#121212]">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-9 h-9 rounded-full" />
        <span className="text-white font-medium text-sm">{name}</span>
      </div>
    </div>
  );
}

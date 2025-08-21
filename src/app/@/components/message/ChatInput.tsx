"use client"

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  isConnected: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onTyping, isConnected, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear typing indicator after user stops typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage('');
    setIsTyping(false);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="w-full rounded-full border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        disabled={disabled || !isConnected}
      />
      <button 
        type="submit" 
        className={`rounded-full w-12 h-12 flex items-center justify-center cursor-pointer transition-colors ${
          disabled || !isConnected || !message.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
        disabled={disabled || !isConnected || !message.trim()}
      >
        <ArrowUp size={23} />
      </button>
    </form>
  );
} 
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (data: {
    roomId: string;
    message: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    receiverId: string;
  }) => void;
  sendTyping: (data: { roomId: string; userId: string; userName: string }) => void;
  stopTyping: (data: { roomId: string; userId: string }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (data: {
    roomId: string;
    message: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    receiverId: string;
  }) => {
    if (socket && isConnected) {
      socket.emit('send_message', data);
    }
  };

  const sendTyping = (data: { roomId: string; userId: string; userName: string }) => {
    if (socket && isConnected) {
      socket.emit('typing', data);
    }
  };

  const stopTyping = (data: { roomId: string; userId: string }) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', data);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { chatApi, chatUtils } from '../services/Api/chat';

export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isDelivered?: boolean;
}

export interface ChatRoom {
  id: string;
  otherUser: {
    id: number;
    username: string;
    avatarUrl: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: number;
  };
  lastMessageAt?: string;
  createdAt: string;
}

export const useChat = (roomId: string, currentUserId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  
  const { socket, isConnected: socketConnected, joinRoom, leaveRoom, sendMessage, sendTyping, stopTyping } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Join room when component mounts
  useEffect(() => {
    if (socketConnected && roomId) {
      joinRoom(roomId);
      setIsConnected(true);
      
      return () => {
        leaveRoom(roomId);
        setIsConnected(false);
      };
    }
  }, [roomId, socketConnected, joinRoom, leaveRoom]);

  // Load initial messages
  useEffect(() => {
    if (roomId && currentUserId) {
      loadMessages();
    }
  }, [roomId, currentUserId]);

  // Load messages from database
  const loadMessages = async (page: number = 1, append: boolean = false) => {
    if (!roomId) return;
    
    try {
      setIsLoading(true);
      const response = await chatApi.getChatMessages(roomId, page);
      
      if (response.success) {
        const formattedMessages = response.data.map((msg: any) => chatUtils.formatMessage(msg));
        
        if (append) {
          setMessages(prev => {
            // Remove duplicates when appending messages
            const existingIds = new Set(prev.map((msg: Message) => msg.id));
            const newMessages = formattedMessages.filter((msg: Message) => !existingIds.has(msg.id));
            
            if (newMessages.length === 0) {
              console.log('🚫 All messages already exist, skipping append');
              return prev;
            }
            
            console.log(`✅ Appending ${newMessages.length} new messages`);
            return [...newMessages, ...prev];
          });
        } else {
          // For initial load, ensure no duplicates exist
          setMessages(prev => {
            if (prev.length === 0) {
              return formattedMessages;
            }
            
            // Merge existing and new messages, removing duplicates
            const existingIds = new Set(prev.map((msg: Message) => msg.id));
            const newMessages = formattedMessages.filter((msg: Message) => !existingIds.has(msg.id));
            
            if (newMessages.length === 0) {
              console.log('🚫 All messages already exist in initial load');
              return prev;
            }
            
            console.log(`✅ Loading ${formattedMessages.length} messages initially`);
            return formattedMessages;
          });
        }
        
        setCurrentPage(page);
        setHasMore(response.pagination.page < response.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMessages(currentPage + 1, true);
    }
  }, [hasMore, isLoading, currentPage]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleReceiveMessage = (data: any) => {
      console.log('🔍 Socket received message:', data);
      console.log('🔍 Current user ID:', currentUserId);
      console.log('🔍 Message sender ID:', data.senderId);
      console.log('🔍 Types:', typeof data.senderId, typeof currentUserId);
      
      // Don't add message if it's from current user (already added optimistically)
      // Convert both to string for comparison to handle type mismatches
      if (String(data.senderId) === String(currentUserId)) {
        console.log('🚫 Skipping own message from socket:', data);
        return;
      }
      
      const formattedMessage = chatUtils.formatMessage(data);
      console.log('✅ Adding message from other user:', formattedMessage);
      
      // Enhanced duplicate check
      setMessages(prev => {
        // Check for exact ID match first
        if (prev.some(msg => msg.id === formattedMessage.id)) {
          console.log('🚫 Duplicate message by ID, skipping:', formattedMessage.id);
          return prev;
        }
        
        // Check for content + sender + timestamp match (within 5 seconds)
        const messageExists = prev.some(msg => 
          msg.content === formattedMessage.content && 
          String(msg.senderId) === String(formattedMessage.senderId) && 
          Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 5000
        );
        
        if (messageExists) {
          console.log('🚫 Duplicate message by content/sender/timestamp, skipping:', formattedMessage);
          return prev;
        }
        
        console.log('✅ Adding new message to state:', formattedMessage);
        return [...prev, formattedMessage];
      });
      
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    // Handle own messages coming back from server (replace optimistic updates)
    const handleOwnMessageReceived = (data: any) => {
      if (String(data.senderId) === String(currentUserId)) {
        console.log('🔄 Own message received from server, replacing optimistic update');
        
        const formattedMessage = chatUtils.formatMessage(data);
        
        setMessages(prev => {
          // Remove optimistic message (negative ID) and add real message
          const filtered = prev.filter(msg => 
            !(msg.content === formattedMessage.content && 
              String(msg.senderId) === String(formattedMessage.senderId) && 
              msg.id < 0) // Remove optimistic messages (negative IDs)
          );
          
          // Add real message if not already present
          if (!filtered.some(msg => msg.id === formattedMessage.id)) {
            return [...filtered, formattedMessage];
          }
          
          return filtered;
        });
      }
    };

    // Handle message delivery confirmation
    const handleMessageDelivered = (data: any) => {
      if (String(data.sender_id) === String(currentUserId)) {
        console.log('✅ Message delivered confirmation received:', data);
        
        // Mark the optimistic message as delivered (optional visual feedback)
        setMessages(prev => prev.map(msg => 
          msg.content === data.content && 
          String(msg.senderId) === String(currentUserId) && 
          msg.id < 0 // Only optimistic messages
            ? { ...msg, isDelivered: true }
            : msg
        ));
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data: any) => {
      console.log('🔍 User typing:', data);
      // Convert both to string for comparison to handle type mismatches
      if (String(data.userId) !== String(currentUserId)) {
        setTypingUsers(prev => [...prev, data.userName]);
      }
    };

    const handleUserStopTyping = (data: any) => {
      console.log('🔍 User stop typing:', data);
      // Convert both to string for comparison to handle type mismatches
      if (String(data.userId) !== String(currentUserId)) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    };

    // Listen for read receipts
    const handleMessagesRead = (data: any) => {
      console.log('🔍 Messages read:', data);
      // Convert both to string for comparison to handle type mismatches
      if (String(data.userId) !== String(currentUserId)) {
        setMessages(prev => prev.map(msg => 
          String(msg.senderId) === String(data.userId) ? { ...msg, isRead: true } : msg
        ));
      }
    };

    // Listen for message errors
    const handleMessageError = (data: any) => {
      console.error('Message error:', data.message);
      // You can show a toast notification here
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_error', handleMessageError);
    socket.on('own_message_received', handleOwnMessageReceived); // Listen for own messages from server
    socket.on('message_delivered', handleMessageDelivered); // Listen for message delivery confirmation

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_error', handleMessageError);
      socket.off('own_message_received', handleOwnMessageReceived); // Clean up listener
      socket.off('message_delivered', handleMessageDelivered); // Clean up listener
    };
  }, [socket, currentUserId]);

  // Send new message
  const sendNewMessage = useCallback(async (content: string, receiverId: number) => {
    if (!isConnected || !content.trim() || !roomId) return;

    try {
      // Send via API first
      const response = await chatApi.sendMessage({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: content.trim(),
        message_type: 'text'
      });

      if (response.success) {
        // Add message to local state immediately (optimistic update)
        // Use a temporary negative ID to avoid conflicts with real message IDs
        const tempId = -(Date.now()); // Negative ID for optimistic updates
        const newMessage: Message = {
          id: tempId,
          content: content.trim(),
          senderId: currentUserId,
          senderName: 'You',
          senderAvatar: '',
          timestamp: new Date().toISOString(),
          isRead: true,
          messageType: 'text'
        };
        
        console.log('✅ Adding optimistic message with temp ID:', tempId);
        setMessages(prev => [...prev, newMessage]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Send via Socket.IO for real-time (but don't add to state again)
        sendMessage({
          roomId,
          message: content.trim(),
          senderId: currentUserId.toString(),
          senderName: 'You',
          senderAvatar: '',
          receiverId: receiverId.toString()
        });

        // Mark room as read for sender
        await chatApi.markRoomAsRead(roomId, currentUserId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [roomId, currentUserId, isConnected, sendMessage]);

  // Start typing indicator
  const startTyping = useCallback((userName: string) => {
    if (isConnected) {
      sendTyping({ roomId, userId: currentUserId.toString(), userName });
    }
  }, [roomId, currentUserId, isConnected, sendTyping]);

  // Stop typing indicator
  const stopTypingIndicator = useCallback(() => {
    if (isConnected) {
      stopTyping({ roomId, userId: currentUserId.toString() });
    }
  }, [roomId, currentUserId, isConnected, stopTyping]);

  // Mark room as read
  const markRoomAsRead = useCallback(async () => {
    if (!roomId || !currentUserId) return;
    
    try {
      await chatApi.markRoomAsRead(roomId, currentUserId);
      
      // Update local messages
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      
      // Notify via Socket.IO
      socket?.emit('mark_read', { roomId, userId: currentUserId });
    } catch (error) {
      console.error('Error marking room as read:', error);
    }
  }, [roomId, currentUserId, socket]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      const response = await chatApi.deleteMessage(messageId, currentUserId);
      
      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, [currentUserId]);

  // Add message manually (for testing)
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return {
    messages,
    typingUsers,
    isLoading,
    hasMore,
    isConnected,
    messagesEndRef,
    sendNewMessage,
    startTyping,
    stopTypingIndicator,
    markRoomAsRead,
    deleteMessage,
    loadMoreMessages,
    addMessage,
    clearMessages,
    scrollToBottom
  };
}; 
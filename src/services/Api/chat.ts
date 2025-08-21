import API from '../../app/services/Api'

// Chat room APIs
export const chatApi = {
  // Get or create chat room between two users
  getOrCreateChatRoom: async (user1Id: number, user2Id: number) => {
    try {
      const response = await API.post(`/messages/rooms`, {
        user1_id: user1Id,
        user2_id: user2Id
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },

  // Get user's chat rooms
  getUserChatRooms: async (userId: number) => {
    try {
      const response = await API.get(`/messages/rooms/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (messageData: {
    sender_id: number;
    receiver_id: number;
    content: string;
    message_type?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }) => {
    try {
      const response = await API.post(`/messages/send`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (roomId: string, page: number = 1, limit: number = 50) => {
    try {
      const response = await API.get(`/messages/chat/${roomId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId: number) => {
    try {
      const response = await API.put(`/messages/read/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  // Mark all messages in room as read
  markRoomAsRead: async (roomId: string, userId: number) => {
    try {
      const response = await API.put(`/messages/room/read`, {
        room_id: roomId,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking room as read:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId: number, userId: number) => {
    try {
      const response = await API.delete(`/messages/${messageId}`, {
        data: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

// Chat utilities
export const chatUtils = {
  // Generate room ID for two users
  generateRoomId: (user1Id: number, user2Id: number): string => {
    const sortedIds = [user1Id, user2Id].sort((a, b) => a - b);
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  },

  // Format message for display
  formatMessage: (message: any) => {
    return {
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      senderName: message.sender?.username || 'Unknown',
      senderAvatar: message.sender?.avatar_url || '',
      timestamp: message.createdAt,
      isRead: message.is_read,
      readAt: message.read_at,
      messageType: message.message_type || 'text',
      fileUrl: message.file_url,
      fileName: message.file_name,
      fileSize: message.file_size
    };
  },

  // Format chat room for display
  formatChatRoom: (room: any, currentUserId: number) => {
    // Support both preformatted (server getUserChatRooms) and raw (create/find) shapes
    const otherUserRaw = room.other_user
      ? room.other_user
      : (room.user1 && room.user2)
        ? (room.user1_id === currentUserId ? room.user2 : room.user1)
        : null;

    const otherUser = otherUserRaw ? {
      id: BigInt(otherUserRaw.id),
      username: otherUserRaw.username,
      avatarUrl: otherUserRaw.avatar_url
    } : { id: BigInt(0), username: 'Unknown', avatarUrl: '' };

    const lastMsgRaw = room.last_message || room.lastMessage || null;

    return {
      id: room.id,
      otherUser,
      lastMessage: lastMsgRaw ? {
        content: lastMsgRaw.content,
        timestamp: lastMsgRaw.createdAt || lastMsgRaw.timestamp,
        senderId: BigInt(lastMsgRaw.sender_id || lastMsgRaw.senderId)
      } : null,
      lastMessageAt: room.last_message_at || room.lastMessageAt,
      createdAt: room.created_at || room.createdAt
    };
  }
}; 
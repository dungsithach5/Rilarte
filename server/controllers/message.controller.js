const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt values safely to JSON (as strings)
const serialize = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

// Get or create chat room between two users
const getOrCreateChatRoom = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;
    
    if (!user1_id || !user2_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User IDs are required' 
      });
    }

    // Check if chat room already exists
    let chatRoom = await prisma.chat_rooms.findFirst({
      where: {
        OR: [
          { user1_id: BigInt(user1_id), user2_id: BigInt(user2_id) },
          { user1_id: BigInt(user2_id), user2_id: BigInt(user1_id) }
        ]
      },
      include: {
        user1: {
          select: { id: true, username: true, avatar_url: true }
        },
        user2: {
          select: { id: true, username: true, avatar_url: true }
        }
      }
    });

    // Create new chat room if it doesn't exist
    if (!chatRoom) {
      chatRoom = await prisma.chat_rooms.create({
        data: {
          user1_id: user1_id,
          user2_id: user2_id
        },
        include: {
          user1: {
            select: { id: true, username: true, avatar_url: true }
          },
          user2: {
            select: { id: true, username: true, avatar_url: true }
          }
        }
      });
    }

    res.json({
      success: true,
      data: serialize(chatRoom)
    });
  } catch (error) {
    console.error('Error in getOrCreateChatRoom:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content, message_type = 'text', file_url, file_name, file_size } = req.body;
    
    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, receiver ID, and content are required'
      });
    }

    // Get or create chat room
    let chatRoom = await prisma.chat_rooms.findFirst({
      where: {
        OR: [
          { user1_id: sender_id, user2_id: receiver_id },
          { user1_id: receiver_id, user2_id: sender_id }
        ]
      }
    });

    if (!chatRoom) {
      chatRoom = await prisma.chat_rooms.create({
        data: {
          user1_id: sender_id,
          user2_id: receiver_id
        }
      });
    }

    // Create message
    const message = await prisma.messages.create({
      data: {
        sender_id: sender_id,
        receiver_id: receiver_id,
        content,
        message_type,
        file_url,
        file_name,
        file_size: file_size ? parseInt(file_size) : null,
        room_id: chatRoom.id
      },
      include: {
        sender: {
          select: { id: true, username: true, avatar_url: true }
        },
        receiver: {
          select: { id: true, username: true, avatar_url: true }
        }
      }
    });

    // Update chat room last message
    await prisma.chat_rooms.update({
      where: { id: chatRoom.id },
      data: {
        last_message_id: message.id,
        last_message_at: new Date()
      }
    });

    res.json({
      success: true,
      data: serialize(message)
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('🔍 getChatMessages called with:', { room_id, page, limit });
    console.log('🔍 req.params:', req.params);
    console.log('🔍 req.query:', req.query);
    
    if (!room_id) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('🔍 Database query params:', { room_id, skip, take: parseInt(limit) });
    
    const messages = await prisma.messages.findMany({
      where: { room_id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        sender: {
          select: { id: true, username: true, avatar_url: true }
        },
        receiver: {
          select: { id: true, username: true, avatar_url: true }
        }
      }
    });
    
    console.log('🔍 Found messages count:', messages.length);

    const total = await prisma.messages.count({
      where: { room_id }
    });

    res.json({
      success: true,
      data: serialize(messages.reverse()), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's chat rooms
const getUserChatRooms = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const chatRooms = await prisma.chat_rooms.findMany({
      where: {
        OR: [
          { user1_id: user_id },
          { user2_id: user_id }
        ]
      },
      include: {
        user1: {
          select: { id: true, username: true, avatar_url: true }
        },
        user2: {
          select: { id: true, username: true, avatar_url: true }
        },
        last_message: {
          select: { id: true, content: true, createdAt: true, sender_id: true }
        }
      },
      orderBy: { last_message_at: 'desc' }
    });

    // Format chat rooms to show other user info
    const formattedRooms = chatRooms.map(room => {
      const otherUser = room.user1_id === BigInt(user_id) ? room.user2 : room.user1;
      return {
        id: room.id,
        user1_id: room.user1_id,
        user2_id: room.user2_id,
        other_user: otherUser,
        last_message: room.last_message,
        last_message_at: room.last_message_at,
        created_at: room.created_at
      };
    });

    res.json({
      success: true,
      data: serialize(formattedRooms)
    });
  } catch (error) {
    console.error('Error in getUserChatRooms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { message_id } = req.params;
    
    if (!message_id) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }

    const message = await prisma.messages.update({
      where: { id: parseInt(message_id) },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    res.json({
      success: true,
      data: serialize(message)
    });
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark all messages in room as read
const markRoomAsRead = async (req, res) => {
  try {
    const { room_id, user_id } = req.body;
    
    if (!room_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and user ID are required'
      });
    }

    await prisma.messages.updateMany({
      where: {
        room_id,
        receiver_id: BigInt(user_id),
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error in markRoomAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { user_id } = req.body; // User requesting deletion
    
    if (!message_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and user ID are required'
      });
    }

    // Check if user owns the message
    const message = await prisma.messages.findFirst({
      where: {
        id: parseInt(message_id),
        sender_id: user_id
      }
    });

    if (!message) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await prisma.messages.delete({
      where: { id: parseInt(message_id) }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getOrCreateChatRoom,
  sendMessage,
  getChatMessages,
  getUserChatRooms,
  markMessageAsRead,
  markRoomAsRead,
  deleteMessage
};

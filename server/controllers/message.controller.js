const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrCreateChatRoom = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;
    
    if (!user1_id || !user2_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User IDs are required' 
      });
    }

    console.log('🔍 Creating/finding chat room for users:', { user1_id, user2_id });

    let chatRoom = await prisma.chat_rooms.findFirst({
      where: {
        OR: [
          { user1_id: parseInt(user1_id), user2_id: parseInt(user2_id) },
          { user1_id: parseInt(user2_id), user2_id: parseInt(user1_id) }
        ]
      },
      include: {
        user1: { select: { id: true, username: true, avatar_url: true } },
        user2: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    if (!chatRoom) {
      console.log('📝 Creating new chat room...');
      chatRoom = await prisma.chat_rooms.create({
        data: { 
          user1_id: parseInt(user1_id), 
          user2_id: parseInt(user2_id) 
        },
        include: {
          user1: { select: { id: true, username: true, avatar_url: true } },
          user2: { select: { id: true, username: true, avatar_url: true } }
        }
      });
      console.log('✅ New chat room created:', chatRoom.id);
    } else {
      console.log('✅ Existing chat room found:', chatRoom.id);
    }

    res.json({
      success: true,
      data: chatRoom
    });
  } catch (error) {
    console.error('❌ Error in getOrCreateChatRoom:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content, message_type = 'text', file_url, file_name, file_size } = req.body;
    
    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, receiver ID, and content are required'
      });
    }

    console.log('📤 Sending message:', { sender_id, receiver_id, content: content.substring(0, 50) + '...' });

    let chatRoom = await prisma.chat_rooms.findFirst({
      where: {
        OR: [
          { user1_id: parseInt(sender_id), user2_id: parseInt(receiver_id) },
          { user1_id: parseInt(receiver_id), user2_id: parseInt(sender_id) }
        ]
      }
    });

    if (!chatRoom) {
      console.log('📝 Creating new chat room for message...');
      chatRoom = await prisma.chat_rooms.create({
        data: { 
          user1_id: parseInt(sender_id), 
          user2_id: parseInt(receiver_id) 
        }
      });
      console.log('✅ New chat room created:', chatRoom.id);
    }

    console.log('💬 Creating message in room:', chatRoom.id);
    const message = await prisma.messages.create({
      data: {
        sender_id: parseInt(sender_id),
        receiver_id: parseInt(receiver_id),
        content,
        message_type,
        file_url,
        file_name,
        file_size: file_size ? parseInt(file_size) : null,
        room_id: chatRoom.id
      },
      include: {
        sender: { select: { id: true, username: true, avatar_url: true } },
        receiver: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    console.log('✅ Message created:', message.id);

    // Update chat room last message
    await prisma.chat_rooms.update({
      where: { id: chatRoom.id },
      data: { last_message_id: message.id, last_message_at: new Date() }
    });

    console.log('✅ Chat room updated with last message');

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('❌ Error in sendMessage:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!room_id) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await prisma.messages.findMany({
      where: { room_id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        sender: { select: { id: true, username: true, avatar_url: true } },
        receiver: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    const total = await prisma.messages.count({ where: { room_id } });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getUserChatRooms = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    console.log('🔍 Fetching chat rooms for user:', user_id);

    // First, get all chat rooms for the user
    const chatRooms = await prisma.chat_rooms.findMany({
      where: {
        OR: [{ user1_id: parseInt(user_id) }, { user2_id: parseInt(user_id) }]
      },
      include: {
        user1: { select: { id: true, username: true, avatar_url: true } },
        user2: { select: { id: true, username: true, avatar_url: true } }
      },
      orderBy: { last_message_at: 'desc' }
    });

    console.log('📋 Found chat rooms:', chatRooms.length);

    // For each room, get the last message separately to avoid relation issues
    const formattedRooms = await Promise.all(chatRooms.map(async (room) => {
      try {
        // Get the last message for this room
        const lastMessage = await prisma.messages.findFirst({
          where: { room_id: room.id },
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, sender_id: true }
        });

        const otherUser = room.user1_id === parseInt(user_id) ? room.user2 : room.user1;
        
        return {
          id: room.id,
          user1_id: room.user1_id,
          user2_id: room.user2_id,
          other_user: otherUser,
          last_message: lastMessage,
          last_message_at: lastMessage ? lastMessage.createdAt : room.created_at,
          created_at: room.created_at
        };
      } catch (roomError) {
        console.error('Error processing room:', room.id, roomError);
        // Return room without last message if there's an error
        const otherUser = room.user1_id === parseInt(user_id) ? room.user2 : room.user1;
        return {
          id: room.id,
          user1_id: room.user1_id,
          user2_id: room.user2_id,
          other_user: otherUser,
          last_message: null,
          last_message_at: room.created_at,
          created_at: room.created_at
        };
      }
    }));

    console.log('✅ Formatted rooms:', formattedRooms.length);

    res.json({ success: true, data: formattedRooms });
  } catch (error) {
    console.error('❌ Error in getUserChatRooms:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const { message_id } = req.params;
    
    if (!message_id) {
      return res.status(400).json({ success: false, message: 'Message ID is required' });
    }

    const message = await prisma.messages.update({
      where: { id: parseInt(message_id) },
      data: { is_read: true, read_at: new Date() }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.markRoomAsRead = async (req, res) => {
  try {
    const { room_id, user_id } = req.body;
    
    if (!room_id || !user_id) {
      return res.status(400).json({ success: false, message: 'Room ID and user ID are required' });
    }

    await prisma.messages.updateMany({
      where: { room_id, receiver_id: user_id, is_read: false },
      data: { is_read: true, read_at: new Date() }
    });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error in markRoomAsRead:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { user_id } = req.body;
    
    if (!message_id || !user_id) {
      return res.status(400).json({ success: false, message: 'Message ID and user ID are required' });
    }

    const message = await prisma.messages.findFirst({
      where: { id: parseInt(message_id), sender_id: user_id }
    });

    if (!message) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }

    await prisma.messages.delete({ where: { id: parseInt(message_id) } });

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

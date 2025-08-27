const express = require('express');
const router = require('./routes/index');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const messageController = require('./controllers/message.controller');

// Function to emit notifications via WebSocket
const emitNotification = (userId, notification) => {
  console.log('📡 Emitting notification to user:', userId, 'Room:', `notifications_${userId}`)
  console.log('📡 Notification data:', notification)
  
  // Check if user is in the room
  const room = io.sockets.adapter.rooms.get(`notifications_${userId}`)
  console.log('📡 Users in room:', room ? room.size : 0)
  
  if (room && room.size > 0) {
    // Log all sockets in the room
    room.forEach(socketId => {
      console.log(`  - Socket in room: ${socketId}`)
    })
    
    io.to(`notifications_${userId}`).emit('new_notification', notification)
    console.log('📡 Notification emitted successfully to room')
  } else {
    console.log('❌ No users in notifications room, notification not delivered')
  }
};

// Make it available globally
global.emitNotification = emitNotification;

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
  }
});

const PORT = 5001;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], 
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Socket.IO connection handling with database integration
io.on('connection', (socket) => {
  console.log('🔌 User connected, socket ID:', socket.id);
  console.log('📊 Total connected users:', io.engine.clientsCount);
  
  // Store user info for routing (optional enhancement)
  socket.userId = 'unknown'; // Will be set when user authenticates
  
  socket.on('user_connected', (userId) => {
    console.log('👤 User authenticated:', userId, 'Socket ID:', socket.id);
    socket.userId = userId;
  });

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Handle new message with database
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, senderId, senderName, senderAvatar, receiverId } = data;
      
      // Don't create message in database here since it's already created via API call
      // Just broadcast the message to other users in the room
      console.log(`Broadcasting message to room ${roomId}:`, message);
      
      // Broadcast message to all other users in the room
      socket.to(roomId).emit('receive_message', {
        id: Date.now(), // Temporary ID for real-time display
        content: message,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        timestamp: new Date().toISOString(),
        message_type: 'text',
        is_read: false
      });
      
      // Also emit to sender for optimistic update replacement
      // This will help the sender know their message was delivered
      socket.emit('message_delivered', {
        content: message,
        sender_id: senderId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Message broadcasted to room ${roomId}:`, message);
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { roomId, userId, userName } = data;
    socket.to(roomId).emit('user_typing', { userId, userName });
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { roomId, userId, userName } = data;
    socket.to(roomId).emit('user_stop_typing', { userId, userName });
  });

  // Test WebSocket connection
  socket.on('test_connection', (data) => {
    console.log('🧪 Test connection received:', data);
    socket.emit('test_response', { 
      message: 'WebSocket connection working!',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle notifications
  socket.on('join_notifications', (userId) => {
    console.log(`📡 join_notifications event received for user: ${userId}, socket: ${socket.id}`);
    
    socket.join(`notifications_${userId}`);
    console.log(`📡 User ${userId} joined notifications room: notifications_${userId}`);
    console.log(`📊 Socket ${socket.id} rooms:`, Array.from(socket.rooms));
    
    // Log all users in this notifications room
    const room = io.sockets.adapter.rooms.get(`notifications_${userId}`);
    if (room) {
      console.log(`📊 Users in notifications_${userId}:`, room.size);
      room.forEach(socketId => {
        console.log(`  - Socket: ${socketId}`);
      });
    } else {
      console.log(`❌ Room notifications_${userId} not found`);
    }
    
    // Test emit to this specific user
    setTimeout(() => {
      console.log(`🧪 Testing emit to user ${userId} in room notifications_${userId}`);
      io.to(`notifications_${userId}`).emit('test_room_join', {
        message: `You are now in notifications room for user ${userId}`,
        room: `notifications_${userId}`,
        timestamp: new Date().toISOString()
      });
    }, 500);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle read receipts
  socket.on('mark_read', async (data) => {
    try {
      const { roomId, userId } = data;
      
      // Mark messages as read in database
      await messageController.markRoomAsRead({
        body: { room_id: roomId, user_id: userId }
      }, {
        json: (result) => {
          if (result.success) {
            // Notify other users that messages were read
            socket.to(roomId).emit('messages_read', { userId });
          }
        },
        status: (code) => ({
          json: (data) => console.error('Error status:', code, data)
        })
      });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle call signaling
  socket.on('call_offer', (data) => {
    console.log('📞 Call offer received from socket:', socket.id);
    console.log('📞 Call offer data:', {
      from: data.from,
      to: data.to,
      callType: data.callType,
      hasOffer: !!data.offer
    });
    
    // Send call offer to target user as incoming_call event
    socket.broadcast.emit('incoming_call', {
      from: data.from,
      fromName: data.fromName,
      callType: data.callType,
      targetUserId: data.to, // This is the user ID, not socket ID
      offer: data.offer // SDP offer
    });
    console.log('📡 Broadcasted incoming_call to all connected users');
    console.log('📡 Event payload:', {
      from: data.from,
      fromName: data.fromName,
      callType: data.callType,
      targetUserId: data.to,
      hasOffer: !!data.offer
    });
  });

  socket.on('call_answer', (data) => {
    console.log('✅ Call answered from:', data.from, 'to:', data.to);
    // Send answer back to caller (broadcast to all sockets for now)
    socket.broadcast.emit('call_answer', {
      from: data.from,
      targetUserId: data.to,
      answer: data.answer // SDP answer
    });
  });

  socket.on('call_reject', (data) => {
    console.log('❌ Call rejected from:', data.from, 'to:', data.to);
    // Notify caller that call was rejected (broadcast to all sockets for now)
    socket.broadcast.emit('call_rejected', {
      from: data.from,
      targetUserId: data.to
    });
  });

  socket.on('call_end', (data) => {
    console.log('📞 Call ended from:', data.from, 'to:', data.to);
    // Notify other user that call ended (broadcast to all sockets for now)
    socket.broadcast.emit('call_ended', {
      from: data.from,
      targetUserId: data.to
    });
  });

  socket.on('ice_candidate', (data) => {
    console.log('🧊 ICE candidate from:', data.from, 'to:', data.to);
    // Forward ICE candidate to other user
    // This should ideally be socket.to(targetSocketId).emit, but currently broadcasts
    socket.broadcast.emit('ice_candidate', { // This line still uses socket.to, which needs socket ID
      from: data.from,
      targetUserId: data.to,
      candidate: data.candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    console.log('📊 Total connected users:', io.engine.clientsCount);
  });
});

router(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

httpServer.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(` Socket.IO server is running with database integration`);
});
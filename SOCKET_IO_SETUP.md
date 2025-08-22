# Socket.IO Chat Setup Guide

## Tổng quan
Dự án này đã được tích hợp Socket.IO để hỗ trợ chat real-time. Hệ thống bao gồm:

- **Server**: Express.js với Socket.IO server
- **Client**: Next.js với Socket.IO client
- **Features**: Real-time messaging, typing indicators, room management

## Cài đặt Dependencies

### Server Dependencies
```bash
cd server
npm install socket.io
```

### Client Dependencies
```bash
npm install socket.io-client
```

## Cấu trúc Files

### Server
- `server/app.js` - Socket.IO server setup
- `server/package.json` - Dependencies

### Client
- `src/context/SocketContext.tsx` - Socket.IO context provider
- `src/hooks/useChat.ts` - Custom hook cho chat functionality
- `src/app/@/components/message/` - Chat components
  - `DrawerChat.tsx` - Main chat interface
  - `ChatInput.tsx` - Message input component
  - `ChatBubble.tsx` - Individual message display
  - `ChatHeader.tsx` - Chat header
  - `ChatUserItem.tsx` - User list item
  - `SocketTest.tsx` - Testing component

## Cách sử dụng

### 1. Khởi động Server
```bash
cd server
npm run dev
```

Server sẽ chạy trên port 5001 với Socket.IO enabled.

### 2. Khởi động Client
```bash
npm run dev
```

Client sẽ chạy trên port 3000 và tự động kết nối với Socket.IO server.

### 3. Sử dụng Chat

#### Basic Usage
```tsx
import { useSocket } from '../context/SocketContext';

function MyComponent() {
  const { socket, isConnected, sendMessage, joinRoom } = useSocket();
  
  // Join a chat room
  useEffect(() => {
    if (isConnected) {
      joinRoom('room-123');
    }
  }, [isConnected, joinRoom]);
  
  // Send a message
  const handleSend = () => {
    sendMessage({
      roomId: 'room-123',
      message: 'Hello!',
      senderId: 'user-1',
      senderName: 'John Doe',
      senderAvatar: 'avatar-url'
    });
  };
  
  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
}
```

#### Using Chat Hook
```tsx
import { useChat } from '../hooks/useChat';

function ChatComponent() {
  const {
    messages,
    typingUsers,
    isConnected,
    sendNewMessage,
    startTyping,
    stopTypingIndicator
  } = useChat('room-123', 'current-user-id');
  
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.senderName}:</strong> {msg.message}
        </div>
      ))}
      
      {typingUsers.length > 0 && (
        <p>{typingUsers.join(', ')} is typing...</p>
      )}
    </div>
  );
}
```

## Socket Events

### Server Events (Received)
- `join_room` - User joins a chat room
- `leave_room` - User leaves a chat room
- `send_message` - User sends a message
- `typing` - User starts typing
- `stop_typing` - User stops typing

### Client Events (Emitted)
- `receive_message` - Receive a new message
- `user_typing` - Another user is typing
- `user_stop_typing` - Another user stopped typing

## Room Management

Chat rooms được tạo tự động dựa trên user IDs:
```typescript
const roomId = `chat_${user1Id}_${user2Id}`;
```

## Typing Indicators

Hệ thống hỗ trợ typing indicators:
- Gửi `typing` event khi user bắt đầu gõ
- Gửi `stop_typing` event khi user dừng gõ
- Hiển thị "X is typing..." cho các user khác

## Testing

Sử dụng `SocketTest` component để test Socket.IO connection:

```tsx
import { SocketTest } from './SocketTest';

function TestPage() {
  return (
    <div>
      <h1>Socket.IO Test</h1>
      <SocketTest />
    </div>
  );
}
```

## Troubleshooting

### Connection Issues
1. Kiểm tra server có đang chạy không
2. Kiểm tra CORS settings trong server
3. Kiểm tra port 5001 có available không

### Message Not Received
1. Kiểm tra room ID có đúng không
2. Kiểm tra user đã join room chưa
3. Kiểm tra console logs

### Performance Issues
1. Sử dụng `useCallback` cho event handlers
2. Cleanup socket listeners trong `useEffect`
3. Implement message pagination nếu cần

## Security Considerations

- Implement authentication cho Socket.IO connections
- Validate message content trước khi broadcast
- Rate limiting cho message sending
- Sanitize user input

## Future Enhancements

- Message persistence với database
- File/image sharing
- Push notifications
- Message encryption
- Group chat support
- Voice/video chat 
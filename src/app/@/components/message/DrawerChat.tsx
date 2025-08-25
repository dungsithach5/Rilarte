"use client"

import * as React from "react"
import { ArrowLeft, ArrowUp } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer"
import { ChatUserItem } from "./ChatUserItem"
import { ChatHeader } from "./ChatHeader"
import { ChatBubble } from "./ChatBubble"
import { ChatInput } from "./ChatInput"
import CallModal from "./CallModal"
import { useChat } from "../../../hooks/useChat"
import { chatApi, chatUtils } from "../../../services/Api/chat"
import { useAuth } from "../../../hooks/useAuth"
import { useSocket } from "../../../context/SocketContext"

import {
  ChatBubbleOvalLeftIcon as ChatOutline,
} from "@heroicons/react/24/outline"
import {
  ChatBubbleOvalLeftIcon as ChatSolid,
} from "@heroicons/react/24/solid"

interface ChatRoom {
  id: string;
  otherUser: {
    id: bigint;
    username: string;
    avatarUrl: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: bigint;
  } | null;
  lastMessageAt?: string;
  createdAt: string;
}

interface DrawerChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedUserId?: bigint;
  selectedUsername?: string;
}

export default function DrawerChat({ 
  isOpen = false, 
  onClose, 
  selectedUserId, 
  selectedUsername 
}: DrawerChatProps) {
  

  const [selected, setSelected] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(() => {

    return isOpen;
  });
  

  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = React.useState(false)
  
  // Call state
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false)
  const [callType, setCallType] = React.useState<'voice' | 'video'>('voice')
  const [isIncomingCall, setIsIncomingCall] = React.useState(false)
  const [incomingCallData, setIncomingCallData] = React.useState<any>(null)
  
  // Get current user from auth
  const { user, isAuthenticated } = useAuth(false)
  const currentUser = React.useMemo(() => {
    // Fallback to previous mock if user is not ready yet
    return {
      id: user?.id ? Number(user.id) : 1,
      name: user?.name || user?.username || "You",
      avatar: user?.image || user?.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg"
    }
  }, [user])
  
  // Socket hook
  const { socket } = useSocket();
  
  // Online users state
  const [onlineUsers, setOnlineUsers] = React.useState<Set<string>>(new Set());
  const [userLastSeen, setUserLastSeen] = React.useState<Map<string, string>>(new Map());
  const [activeUsers, setActiveUsers] = React.useState<Set<string>>(new Set());
  


  // Emit user connected event for server routing
  React.useEffect(() => {
    if (socket && currentUser.id) {
      socket.emit('user_connected', String(currentUser.id));
    }
  }, [socket, currentUser.id]);

  // Handle online users updates
  React.useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (data: any) => {
      setOnlineUsers(prev => new Set(Array.from(prev).concat(data.userId)));
      // Add to active users when user comes online
      setActiveUsers(prev => new Set(Array.from(prev).concat(data.userId)));
      // Remove last seen when user comes online
      setUserLastSeen(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    const handleUserOffline = (data: any) => {
      setOnlineUsers(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(data.userId);
        return newSet;
      });
      // Remove from active users when user goes offline
      setActiveUsers(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(data.userId);
        return newSet;
      });
      // Set last seen when user goes offline
      setUserLastSeen(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, new Date().toISOString());
        return newMap;
      });
    };

    const handleOnlineUsersList = (data: any) => {
      setOnlineUsers(new Set(data.onlineUsers));
    };

    const handleUserActivity = (data: any) => {
      // Update last seen when user has activity
      if (data.userId && data.timestamp) {
        setUserLastSeen(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.timestamp);
          return newMap;
        });
        // Mark user as active when they have activity
        setActiveUsers(prev => new Set(Array.from(prev).concat(data.userId)));
      }
    };

    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('online_users_list', handleOnlineUsersList);
    socket.on('user_activity', handleUserActivity);

    // Request current online users list
    socket.emit('get_online_users');

    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('online_users_list', handleOnlineUsersList);
      socket.off('user_activity', handleUserActivity);
    };
  }, [socket]);

  // Handle incoming calls
  React.useEffect(() => {
    if (!socket) {
      return;
    }

    const handleIncomingCall = (data: any) => {
      if (String(data.targetUserId) === String(currentUser.id)) {
        setCallType(data.callType);
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
        setIncomingCallData({
          from: data.from,
          fromName: data.fromName,
          callType: data.callType,
          offer: data.offer // Pass offer for incoming calls
        });
      }
    };

    const handleCallAccepted = (data: any) => {
      if (String(data.targetUserId) === String(currentUser.id)) {
        setIsIncomingCall(false);
        // TODO: Implement actual call connection with answer
      }
    };

    const handleCallRejected = (data: any) => {
      if (String(data.targetUserId) === String(currentUser.id)) {
        setIsCallModalOpen(false);
        setIncomingCallData(null);
      }
    };

    const handleCallEnded = (data: any) => {
      if (String(data.targetUserId) === String(currentUser.id)) {
        setIsCallModalOpen(false);
        setIncomingCallData(null);
      }
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, currentUser.id, setCallType, setIsIncomingCall, setIsCallModalOpen, setIncomingCallData]);

  // Emit user offline when component unmounts
  React.useEffect(() => {
    return () => {
      if (socket && currentUser.id) {
        socket.emit('user_offline', {
          userId: String(currentUser.id),
          timestamp: new Date().toISOString()
        });
      }
    };
  }, [socket, currentUser.id]);

  // Emit user activity periodically to keep status fresh
  React.useEffect(() => {
    if (!socket || !currentUser.id) return;

    const interval = setInterval(() => {
      socket.emit('user_activity', {
        userId: String(currentUser.id),
        timestamp: new Date().toISOString()
      });
    }, 30000); // Emit activity every 30 seconds

    return () => clearInterval(interval);
  }, [socket, currentUser.id]);



  // Get room ID when user is selected
  const roomId = selected !== null && chatRooms[selected] ? chatRooms[selected].id : ""
  

  
  // Use chat hook - chỉ khi có roomId và currentUser.id
  const {
    messages,
    typingUsers,
    isConnected,
    sendNewMessage,
    startTyping,
    stopTypingIndicator,
    markRoomAsRead,
    isLoading,
    hasMore,
    loadMoreMessages,
    messagesEndRef
  } = useChat(roomId, currentUser.id);



  // Handle external open/close
  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Handle direct message from profile
  React.useEffect(() => {
    if (selectedUserId && selectedUsername && open) {
      // Nếu chatRooms chưa load, đợi load xong rồi xử lý
      if (chatRooms.length > 0) {
        handleDirectMessage(selectedUserId, selectedUsername);
      }
      // Nếu chatRooms chưa có, sẽ được xử lý trong loadChatRooms
    }
  }, [selectedUserId, selectedUsername, open, chatRooms.length]);

  // Load chat rooms when component mounts
  React.useEffect(() => {
    if (open && currentUser.id) {
      loadChatRooms();
    }
  }, [open, currentUser.id]);

  // Load chat rooms from API
  const loadChatRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const response = await chatApi.getUserChatRooms(currentUser.id);
      
      if (response.success) {
        const formattedRooms = response.data.map((room: any) => 
          chatUtils.formatChatRoom(room, currentUser.id)
        );
        setChatRooms(formattedRooms);
        
        // Nếu có direct message request, ưu tiên chọn đúng room theo otherUser.id
        if (selectedUserId) {
          const idx = formattedRooms.findIndex((r: ChatRoom) => r.otherUser.id === selectedUserId);
          if (idx >= 0) {
            setSelected(idx);
          } else {
            // Nếu không tìm thấy room, tạo mới
            handleDirectMessage(selectedUserId, selectedUsername || '');
          }
        }
      } else {
        // Nếu API fail, set empty array thay vì mock data
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      // Không dùng mock data nữa, chỉ set empty array
      setChatRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Handle direct message from profile
  const handleDirectMessage = async (userId: bigint, username: string) => {
    try {
      // Check if chat room already exists by otherUser.id
      let existingRoom = chatRooms.find(room => 
        room.otherUser.id === userId
      );

      if (!existingRoom) {
        // Create new chat room
        const response = await chatApi.getOrCreateChatRoom(Number(currentUser.id), Number(userId));
        
        if (response.success) {
          const newRoom = chatUtils.formatChatRoom(response.data, currentUser.id);
          
          setChatRooms((prev: ChatRoom[]) => {
            const updated = [newRoom, ...prev.filter((r: ChatRoom) => r.id !== newRoom.id)];
            return updated;
          });
          
          // Select the newly created room
          setSelected(0);
        } else {
          console.error('Failed to create chat room:', response);
        }
      } else {
        // Select index of existing room by id
        const roomIndex = chatRooms.findIndex(room => room.id === existingRoom!.id);
        setSelected(roomIndex >= 0 ? roomIndex : 0);
      }
    } catch (error) {
      console.error('Error creating direct message:', error);
    }
  };

  // Handle send message
  const handleSendMessage = (message: string) => {
    if (selected === null || !chatRooms[selected]) {
      return;
    }
    
    if (!roomId) {
      return;
    }
    
    const receiverId = Number(chatRooms[selected].otherUser.id);
    
    try {
      sendNewMessage(message, receiverId);
    } catch (error) {
      console.error('Error in sendNewMessage:', error);
    }
  };

  // Handle typing
  const handleTyping = (isTyping: boolean) => {
    if (isTyping) {
      // Chỉ start typing nếu chưa có trong typingUsers
      if (!typingUsers.includes(currentUser.name)) {
        startTyping(currentUser.name);
      }
    } else {
      // Luôn stop typing khi không còn typing
      stopTypingIndicator();
    }
  };

  // Mark room as read when user opens chat
  React.useEffect(() => {
    if (selected !== null && roomId) {
      markRoomAsRead();
    }
  }, [selected, roomId, markRoomAsRead]);

  // Auto-stop typing after 3 seconds of inactivity
  React.useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (typingUsers.includes(currentUser.name)) {
      typingTimeout = setTimeout(() => {
        stopTypingIndicator();
      }, 3000);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingUsers, currentUser.name, stopTypingIndicator]);

    // Handle close
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    
    if (onClose) {
      onClose();
    }
  };

  // Call handlers
  const handleVoiceCall = () => {
    if (selected !== null && chatRooms[selected]) {
      const targetUser = chatRooms[selected].otherUser;
      
      if (socket) {
        socket.emit('call_offer', {
          from: String(currentUser.id),
          fromName: currentUser.name,
          to: String(targetUser.id),
          callType: 'voice'
        });
      }
      setCallType('voice');
      setIsIncomingCall(false); // Outgoing call
      setIsCallModalOpen(true);
    }
  };

  const handleVideoCall = () => {
    if (selected !== null && chatRooms[selected]) {
      const targetUser = chatRooms[selected].otherUser;
      
      if (socket) {
        socket.emit('call_offer', {
          from: String(currentUser.id),
          fromName: currentUser.name,
          to: String(targetUser.id),
          callType: 'video'
        });
      }
      setCallType('video');
      setIsIncomingCall(false); // Outgoing call
      setIsCallModalOpen(true);
    }
  };

  const handleAcceptCall = () => {
    if (socket && incomingCallData) {
      socket.emit('call_answer', {
        from: String(currentUser.id),
        to: String(incomingCallData.from)
      });
    }
    setIsIncomingCall(false);
  };

  const handleRejectCall = () => {
    if (socket && incomingCallData) {
      socket.emit('call_reject', {
        from: String(currentUser.id),
        to: String(incomingCallData.from)
      });
    }
    setIsCallModalOpen(false);
    setIncomingCallData(null);
  };

  const handleEndCall = () => {
    if (socket && selected !== null && chatRooms[selected]) {
      const targetUser = chatRooms[selected].otherUser;
      socket.emit('call_end', {
        from: String(currentUser.id),
        to: String(targetUser.id)
      });
    }
    setIsCallModalOpen(false);
    setIncomingCallData(null);
  };

  // Error boundary để bắt lỗi JavaScript
  try {
    
    return (
              <Drawer direction="right" open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
        }}>
        <DrawerTrigger asChild>
        <button onClick={() => setSelected(null)} className="cursor-pointer">
          {open ? (
            <ChatSolid className="w-7 h-7 text-gray-800" />
          ) : (
            <ChatOutline className="w-7 h-7 text-gray-800" />
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="flex w-full h-screen overflow-hidden">

          
          {selected === null ? (
            <div className="w-full h-auto">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="text-black font-bold text-2xl">Chats</div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto h-[450px]">
                {isLoadingRooms ? (
                  <div className="p-4 text-center text-gray-500">Loading chats...</div>
                ) : chatRooms.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No chats yet</div>
                ) : (
                  <>
                    {/* Online users count */}
                    {onlineUsers.size > 0 && (
                      <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{onlineUsers.size} user{onlineUsers.size !== 1 ? 's' : ''} online</span>
                        </div>
                      </div>
                    )}
                    
                    {chatRooms.map((room, idx) => (
                      <div
                        key={room.id}
                        onClick={() => setSelected(idx)}
                        className="cursor-pointer"
                      >
                        <ChatUserItem
                          name={room.otherUser.username}
                          message={room.lastMessage?.content || "Start a conversation"}
                          time={room.lastMessageAt || new Date().toISOString()}
                          avatar={room.otherUser.avatarUrl}
                          unreadCount={0} // TODO: Calculate from messages
                                                  isOnline={onlineUsers.has(String(room.otherUser.id))}
                        isActive={activeUsers.has(String(room.otherUser.id))}
                        lastSeen={userLastSeen.get(String(room.otherUser.id)) || room.lastMessageAt}
                          isTyping={typingUsers.includes(room.otherUser.username) && room.otherUser.username !== currentUser.name}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-gray-500">
                <button className="mr-2" onClick={() => setSelected(null)}>
                  <ArrowLeft size={30} className="cursor-pointer" />
                </button>
                <ChatHeader
                  name={chatRooms[selected]?.otherUser.username || "User"}
                  avatar={chatRooms[selected]?.otherUser.avatarUrl || null}
                  isOnline={selected !== null && onlineUsers.has(String(chatRooms[selected]?.otherUser.id))}
                  isActive={selected !== null && activeUsers.has(String(chatRooms[selected]?.otherUser.id))}
                  lastSeen={selected !== null ? userLastSeen.get(String(chatRooms[selected]?.otherUser.id)) || chatRooms[selected]?.lastMessageAt : undefined}
                  onCall={handleVoiceCall}
                  onVideoCall={handleVideoCall}
                  onSearch={() => {}}
                  onMore={() => {}}
                />
                

              </div>
              
              <div className="flex-1 overflow-y-auto py-2">
                {/* Load more messages button */}
                {hasMore && (
                  <div className="text-center p-2">
                    <button
                      onClick={loadMoreMessages}
                      disabled={isLoading}
                      className="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                    >
                      {isLoading ? 'Loading...' : 'Load more messages'}
                    </button>
                  </div>
                )}
                
                {/* Messages */}
                {messages.map((msg, i) => {
                  const isOwnMessage = String(msg.senderId) === String(currentUser.id);
                  
                  return (
                    <ChatBubble
                      key={msg.id || i}
                      message={msg.content}
                      isSender={isOwnMessage}
                      avatar={!isOwnMessage ? chatRooms[selected]?.otherUser.avatarUrl : undefined}
                      timestamp={msg.timestamp}
                      isRead={msg.isRead}
                      messageType={msg.messageType}
                      fileUrl={msg.fileUrl}
                      fileName={msg.fileName}
                      isSenderOnline={!isOwnMessage ? onlineUsers.has(String(chatRooms[selected]?.otherUser.id)) : undefined}
                      isSenderActive={!isOwnMessage ? activeUsers.has(String(chatRooms[selected]?.otherUser.id)) : undefined}
                    />
                  );
                })}
                
                {/* Typing indicator - chỉ hiển thị khi người khác trong room hiện tại đang typing */}
                {(() => {
                  const currentRoomOtherUser = chatRooms[selected]?.otherUser.username;
                  const otherUserTyping = currentRoomOtherUser && typingUsers.includes(currentRoomOtherUser);
                  
                  return otherUserTyping ? (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">
                      {currentRoomOtherUser} is typing...
                    </div>
                  ) : null;
                })()}
                
                {/* Messages end ref for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  isConnected={isConnected}
                  disabled={selected === null}
                />
                {!isConnected && (
                  <div className="text-center text-sm text-red-500 mt-2">
                    Connecting to chat server...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
      
      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
        }}
        callType={callType}
        otherUser={{
          name: isIncomingCall && incomingCallData 
            ? incomingCallData.fromName 
            : (selected !== null ? chatRooms[selected]?.otherUser.username || "User" : "User"),
          avatar: selected !== null ? chatRooms[selected]?.otherUser.avatarUrl : null
        }}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEnd={handleEndCall}
        isIncoming={isIncomingCall}
        targetUserId={isIncomingCall && incomingCallData 
          ? incomingCallData.from 
          : (selected !== null ? String(chatRooms[selected]?.otherUser.id) : undefined)
        }
      />
      


    </Drawer>
  );
  
  } catch (error) {
    console.error('DrawerChat render error:', error);
    
    // Fallback UI khi có lỗi
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
        <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Chat Error</h3>
          </div>
          <div className="p-4">
            <p className="text-red-500">Error rendering chat:</p>
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded">
              {error instanceof Error ? error.message : String(error)}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

"use client"

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileHeader from '../../@/components/ProfileHeader';
import ProfileTabs from '../../@/components/ProfileTabs';
import DrawerChat from '../../@/components/message/DrawerChat';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<{id: bigint, username: string} | null>(null);

  // Đảm bảo selectedChatUser luôn được set đúng khi userId thay đổi
  React.useEffect(() => {
    if (userId) {
      // Tạm thời set username là userId nếu chưa có username thực
      const newSelectedChatUser = { id: BigInt(userId), username: userId };
      setSelectedChatUser(newSelectedChatUser);
    }
  }, [userId]);

  if (!userId) {
    return <div>User ID not found</div>;
  }

  const handleMessageClick = (userId: bigint, username: string) => {
    // Đảm bảo dữ liệu hợp lệ
    if (!userId || !username) {
      return;
    }
    
    // Luôn set selectedChatUser trước khi mở chat
    setSelectedChatUser({ id: userId, username });
    
    // Mở chat
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    
    // Chỉ reset selectedChatUser khi thực sự cần thiết
    // setSelectedChatUser(null);
  };



  return (
    <main className="">
      <ProfileHeader 
        targetUserId={userId} 
        onMessageClick={(userId: bigint, username: string) => {
          handleMessageClick(userId, username);
        }}
      />
      <ProfileTabs targetUserId={userId} />
      
      {/* Chat Drawer - Sử dụng trực tiếp DrawerChat */}
      <DrawerChat 
        isOpen={isChatOpen}
        onClose={handleChatClose}
        selectedUserId={selectedChatUser?.id}
        selectedUsername={selectedChatUser?.username}
      />
    </main>
  )
} 
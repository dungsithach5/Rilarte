"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { MessageButton } from "./ui/MessageButton"; // Correct relative path
import API from "../../services/Api";

interface ProfileHeaderProps {
  targetUserId?: string;
  onMessageClick?: (userId: bigint, username: string) => void; // Updated to bigint
}

interface UserProfile {
  id: number;
  username: string;
  avatar: string;
  name: string;
  email?: string;
  bio?: string;
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

export default function ProfileHeader({ targetUserId, onMessageClick }: ProfileHeaderProps) {
  const { session, status, user } = useAuth(true);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Xác định user hiện tại và user target
  const currentUserId = user?.id || session?.user?.id;
  const isOwnProfile = !targetUserId || currentUserId?.toString() === targetUserId;
  


  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId) return;
      
      setIsLoading(true);
      try {
        const response = await API.get(`/users/public/${targetUserId}`);
        if (response.data.success) {
          setTargetUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching target user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTargetUser();
  }, [targetUserId]);

  const handleFollow = async () => {
    if (!currentUserId || !targetUserId) return;
    
    try {
      if (isFollowing) {
        await API.delete(`/follows/${currentUserId}/${targetUserId}`);
        setIsFollowing(false);
      } else {
        await API.post(`/follows`, {
          follower_id: currentUserId,
          following_id: targetUserId
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const handleMessageClick = (userId: bigint, username: string) => {
    if (onMessageClick) {
      onMessageClick(userId, username);
    }
  };

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  if (!session && !targetUserId) {
    return null
  }

  // Sử dụng thông tin user target nếu có, không thì dùng session
  const displayUser = targetUser || session?.user;
  const displayName = targetUser?.name || targetUser?.username || (session?.user as SessionUser)?.name || (session?.user as SessionUser)?.username;
  const displayEmail = targetUser?.email || (session?.user as SessionUser)?.email;
  const displayAvatar = targetUser?.avatar || (session?.user as SessionUser)?.image;

  return (
    <section className="w-full relative">      
      <img
        src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JhZGllbnR8MHx8MHx8fDA%3D"
        alt=""
        className="w-full h-[300px] object-cover"
      />

      <div className="absolute top-60 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full overflow-hidden">
        {displayAvatar && (
          <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="mt-24 text-center">
        <h2 className="text-xl font-semibold">{displayName}</h2>
        {displayEmail && <p className="text-gray-400">{displayEmail}</p>}
        {targetUser?.bio && <p className="text-gray-300 mt-2">{targetUser.bio}</p>}
      </div>

      {!isOwnProfile && targetUser && (
        <div className="flex justify-center gap-4 mt-4 text-center">
          <button 
            onClick={handleFollow}
            className={`border px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors ${
              isFollowing 
                ? 'bg-gray-600 text-white' 
                : 'hover:bg-black'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          
          <MessageButton
            userId={BigInt(targetUser.id)}
            username={targetUser.username || targetUser.name}
            onMessageClick={handleMessageClick}
            variant="outline"
            size="md"
          />
        </div>
      )}
      
      {/* Test button để debug */}

      

    </section>
  );
}
  
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

interface ProfileHeaderProps {
  targetUserId?: string;
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

export default function ProfileHeader({ targetUserId }: ProfileHeaderProps) {
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
        const response = await axios.get(`http://localhost:5001/api/users/public/${targetUserId}`);
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
        await axios.delete(`http://localhost:5001/api/follows/${currentUserId}/${targetUserId}`);
        setIsFollowing(false);
      } else {
        await axios.post(`http://localhost:5001/api/follows`, {
          follower_id: currentUserId,
          following_id: targetUserId
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
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
  const displayAvatar = targetUser?.avatar || (session?.user as SessionUser)?.image;

  return (
    <section className="w-full mt-20">      
      <div className="mx-auto w-40 h-40 rounded-full overflow-hidden">
        {displayAvatar && (
          <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold">{displayName}</h2>
        <div className="flex justify-center gap-4 mt-2 text-gray-500">
          <h2>0 followers</h2>
          <h2>0 following</h2>
        </div>
        {targetUser?.bio && <p className="text-gray-300 mt-2">{targetUser.bio}</p>}
      </div>

      {!isOwnProfile && (
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
          <button className="border px-4 py-2 rounded-full cursor-pointer hover:text-white hover:bg-black">
            Message
          </button>
        </div>
      )}
    </section>
  );
}
  
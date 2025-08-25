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
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const currentUserId = user?.id || session?.user?.id;
  const isOwnProfile = !targetUserId || currentUserId?.toString() === targetUserId;
  


  // Lấy thông tin user target
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

  // Lấy số followers/following
  const fetchStats = async () => {
    if (!targetUserId) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/follows/stats/${targetUserId}`);
      if (res.data.success) {
        setStats({
          followers: res.data.followers,
          following: res.data.following
        });
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [targetUserId]);

  const handleFollow = async () => {
    if (!currentUserId || !targetUserId) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        // UNFOLLOW
        await axios.post(`http://localhost:5001/api/follows/unfollow`, {
          follower_id: currentUserId,
          following_id: targetUserId
        });
        setIsFollowing(false);
      } else {
        // FOLLOW
        await axios.post(`http://localhost:5001/api/follows`, {
          follower_id: currentUserId,
          following_id: targetUserId
        });
        setIsFollowing(true);
      }
      // cập nhật lại số lượng sau khi follow/unfollow
      fetchStats();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setFollowLoading(false);
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
          <h2>{stats.followers} followers</h2>
          <h2>{stats.following} following</h2>
        </div>
        {targetUser?.bio && <p className="text-gray-300 mt-2">{targetUser.bio}</p>}
      </div>

      {!isOwnProfile && targetUser && (
        <div className="flex justify-center gap-4 mt-4 text-center">
          <button 
            onClick={handleFollow}
            disabled={followLoading}
            className={`border px-4 py-2 rounded-full cursor-pointer transition-colors ${
              isFollowing 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'hover:bg-black hover:text-white'
            } disabled:opacity-50`}
          >
            {followLoading ? "..." : isFollowing ? 'Following' : 'Follow'}
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

"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/tabs";
import { ComposerComment } from "./model-comment/ComposerComment";
import { fetchPosts, fetchPostsByUserId } from "../../services/Api/posts";
import { getSavedPosts } from "../../services/Api/savedPosts";
import { useAuth } from "../../hooks/useAuth";
import SkeletonPost from "./skeleton-post";

const breakpointColumnsObj = {
  default: 6,
  1024: 2,
  640: 2,
};

interface ProfileTabsProps {
  targetUserId?: string;
}

export default function ProfileTabs({ targetUserId }: ProfileTabsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("post");
  const { user, session } = useAuth(true);

  // Xác định user ID để load posts
  const currentUserId = user?.id || session?.user?.id;
  const targetId = targetUserId || currentUserId?.toString();
  const isOwnProfile = !targetUserId || currentUserId?.toString() === targetUserId;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        console.log('=== PROFILE TABS DEBUG ===');
        console.log('User from useAuth:', user);
        console.log('Session from useAuth:', session);
        console.log('Current User ID:', currentUserId);
        console.log('Target User ID:', targetId);
        console.log('Is Own Profile:', isOwnProfile);
        
        if (!targetId) {
          console.log('No target ID found, loading all posts');
          const data = await fetchPosts("");
          const mapped = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            name: user?.username || user?.name,
            title: item.title,
            content: item.content,
            image_url: item.image_url,
            likeCount: item.likeCount || 0,
          }));
          setPosts(mapped);
        } else {
          console.log('Loading posts for target ID:', targetId);
          const data = await fetchPostsByUserId(Number(targetId));
          const mapped = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            name: user?.username || user?.name || item.user_name,
            title: item.title,
            content: item.content,
            image_url: item.image_url,
            likeCount: item.likeCount || 0,
          }));
          setPosts(mapped);
          console.log('Target user posts loaded:', mapped.length, 'posts');
        }
      } catch (err) {
        console.error("Error loading posts", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [user, session, targetId, isOwnProfile]);

  // Load saved posts when needed (chỉ cho profile của chính mình)
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (activeTab === "saved" && isOwnProfile) {
        if (currentUserId) {
          try {
            console.log('Loading saved posts for current user ID:', currentUserId);
            const data = await getSavedPosts(Number(currentUserId));
            const mapped = data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              name: user?.username || user?.name || item.user_name,
              title: item.title,
              content: item.content,
              image_url: item.image_url,
              likeCount: item.likeCount || 0,
            }));
            setSavedPosts(mapped);
            console.log('Saved posts loaded:', mapped.length, 'posts');
          } catch (err) {
            console.error("Error loading saved posts", err);
          }
        }
      }
    };

    loadSavedPosts();
  }, [activeTab, user, session, currentUserId, isOwnProfile]);

  const handleDeletePost = async (postId: number) => {
    // Chỉ cho phép xóa post của chính mình
    if (!isOwnProfile) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  return (
    <Tabs defaultValue="post" onValueChange={setActiveTab} className="mt-6 px-6">
      <TabsList className="mx-auto space-x-80 border-b border-white/10 bg-transparent">
        <TabsTrigger value="post">Post</TabsTrigger>
        {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
      </TabsList>

      <TabsContent value="post">
        {isLoading ? (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-4"
            columnClassName="flex flex-col gap-4"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonPost key={i} index={i} />
            ))}
          </Masonry>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-4"
            columnClassName="flex flex-col"
          >
            {posts.map((post) => {
              console.log('=== PROFILE TABS POST DEBUG ===');
              console.log('Rendering post:', post.id);
              console.log('Current user ID:', currentUserId);
              console.log('Is own profile:', isOwnProfile);
              
              return (
                <ComposerComment
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId ? Number(currentUserId) : undefined}
                  onDelete={isOwnProfile ? handleDeletePost : undefined}
                />
              );
            })}
          </Masonry>
        )}
      </TabsContent>

      {/* Saved Posts - chỉ hiển thị cho profile của chính mình */}
      {isOwnProfile && (
        <TabsContent value="saved">
          {isLoading ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-4"
              columnClassName="flex flex-col gap-4"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonPost key={i} index={i} />
              ))}
            </Masonry>
          ) : savedPosts.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-4"
              columnClassName="flex flex-col"
            >
              {savedPosts.map((post) => {
                console.log('=== SAVED POSTS DEBUG ===');
                console.log('Rendering saved post:', post.id);
                console.log('Current user ID:', currentUserId);
                
                return (
                  <ComposerComment
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId ? Number(currentUserId) : undefined}
                    onDelete={handleDeletePost}
                  />
                );
              })}
            </Masonry>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No saved posts yet</p>
              <p className="text-sm text-gray-400 mt-2">Posts you save will appear here</p>
            </div>
          )}
        </TabsContent>
      )}

      {/* Following */}
      <TabsContent value="following" className="mt-6 mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://ui.shadcn.com/avatars/01.png"
              alt="Avatar"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Sofia Davis</span>
            <span className="text-gray-500 text-sm">m@example.com</span>
          </div>
          <button className="ml-auto flex items-center border border-gray-300 rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100 transition cursor-pointer">
            Follow
          </button>
        </div>
      </TabsContent>

      {/* Followers */}
      <TabsContent value="followers" className="mt-6 mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://ui.shadcn.com/avatars/01.png"
              alt="Avatar"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">John Dofe</span>
            <span className="text-gray-500 text-sm">m@example.com</span>
          </div>
          <button className="ml-auto flex items-center border border-gray-300 rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100 transition cursor-pointer">
            Follow
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

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

export default function ProfileTabs() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("post");
  const { user, session } = useAuth(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Lấy user ID từ Redux hoặc session
        const userId = user?.id || session?.user?.id;
        
        console.log('=== PROFILE TABS DEBUG ===');
        console.log('User from useAuth:', user);
        console.log('Session from useAuth:', session);
        console.log('User ID:', userId);
        
        if (!userId) {
          console.log('No user ID found, loading all posts');
          const data = await fetchPosts("");
          const mapped = data.map((item: any) => ({
            id: item.id,
            name: user?.username || user?.name,
            title: item.title,
            content: item.content,
            image_url: item.image_url,
            likeCount: item.likeCount || 0,
            download_protected: item.download_protected,
          }));
          setPosts(mapped);
        } else {
          console.log('Loading posts for user ID:', userId);
          const data = await fetchPostsByUserId(Number(userId));
          const mapped = data.map((item: any) => ({
            id: item.id,
            name: user?.username || user?.name || item.user_name,
            title: item.title,
            content: item.content,
            image_url: item.image_url,
            likeCount: item.likeCount || 0,
            download_protected: item.download_protected,
          }));
          setPosts(mapped);
          console.log('User posts loaded:', mapped.length, 'posts');
        }
      } catch (err) {
        console.error("Error loading posts", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [user, session]);

  // Load saved posts when needed
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (activeTab === "saved") {
        const userId = user?.id || session?.user?.id;
        if (userId) {
          try {
            console.log('Loading saved posts for user ID:', userId);
            const data = await getSavedPosts(Number(userId));
            const mapped = data.map((item: any) => ({
              id: item.id,
              name: user?.username || user?.name || item.user_name,
              title: item.title,
              content: item.content,
              image_url: item.image_url,
              likeCount: item.likeCount || 0,
              download_protected: item.download_protected,
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
  }, [activeTab, user, session]);

  const handleDeletePost = async (postId: number) => {
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
        <TabsTrigger value="saved">Saved</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
      </TabsList>

      <TabsContent
        value="post"
      >
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
              // Thử nhiều cách để lấy user ID
              const reduxUserId = user?.id;
              const sessionUserId = session?.user?.id;
              const userId = reduxUserId || sessionUserId;
              
              console.log('=== PROFILE TABS POST DEBUG ===');
              console.log('Rendering post:', post.id);
              console.log('Redux user ID:', reduxUserId);
              console.log('Session user ID:', sessionUserId);
              console.log('Final user ID:', userId);
              console.log('User object:', user);
              console.log('Session user:', session?.user);
              
              return (
                <ComposerComment
                  key={post.id}
                  post={post}
                  currentUserId={userId ? Number(userId) : undefined}
                  onDelete={handleDeletePost}
                />
              );
            })}
          </Masonry>
        )}
      </TabsContent>

      {/* Saved Posts */}
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
              const reduxUserId = user?.id;
              const sessionUserId = session?.user?.id;
              const userId = reduxUserId || sessionUserId;
              
              console.log('=== SAVED POSTS DEBUG ===');
              console.log('Rendering saved post:', post.id);
              console.log('User ID being passed:', userId);
              
              return (
                <ComposerComment
                  key={post.id}
                  post={post}
                  currentUserId={userId ? Number(userId) : undefined}
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

"use client";

import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/tabs";
import { ComposerComment } from "./model-comment/ComposerComment";
import { useAuth } from "../../hooks/useAuth";
import SkeletonMasonry from "../components/skeleton-post";
import API from "../../services/Api";

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

  const currentUserId = user?.id || session?.user?.id;
  const targetId = targetUserId || currentUserId?.toString();
  const isOwnProfile = !targetUserId || currentUserId?.toString() === targetUserId;

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  // --- Load posts ---
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (targetId) params.user_id = targetId;

        const response = await API.get("/posts", { params });
        const edges = response.data.edges || [];

        const mappedPosts = edges.map((e: any) => ({
          ...e.node,
          id: e.node.id,
        }));

        setPosts(mappedPosts);
      } catch (err) {
        console.error("Error loading posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
    // Chỉ track targetId (string), không track object user/session trực tiếp
  }, [targetId]);
  
  // --- Load saved posts ---
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (!isOwnProfile || activeTab !== "saved") return;

      setIsLoading(true);
      try {
        if (!currentUserId) return;
        const response = await API.get(`/saved-posts`, {
          params: { user_id: currentUserId },
        });
        setSavedPosts(response.data || []);
      } catch (err) {
        console.error("Error loading saved posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPosts();
  }, [activeTab, currentUserId, isOwnProfile]);

  const handleDeletePost = async (postId: number) => {
    if (!isOwnProfile) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const renderPosts = (postArray: any[]) => (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-4"
      columnClassName="flex flex-col"
    >
      {postArray.map((post) => (
        <ComposerComment
          key={post.id}
          post={post}
          currentUserId={currentUserId ? Number(currentUserId) : undefined}
          onDelete={isOwnProfile ? handleDeletePost : undefined}
        />
      ))}
    </Masonry>
  );

  return (
    <Tabs defaultValue="post" onValueChange={setActiveTab} className="mt-6 px-6">
      <TabsList className="mx-auto space-x-80 border-b border-white/10 bg-transparent">
        <TabsTrigger value="post">Post</TabsTrigger>
        {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
      </TabsList>

      <TabsContent value="post">
        {isLoading ? <SkeletonMasonry count={20} /> : renderPosts(posts)}
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="saved">
          {isLoading ? (
            <SkeletonMasonry count={20} />
          ) : savedPosts.length > 0 ? (
            renderPosts(savedPosts)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No saved posts yet</p>
              <p className="text-sm text-gray-400 mt-2">Posts you save will appear here</p>
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}

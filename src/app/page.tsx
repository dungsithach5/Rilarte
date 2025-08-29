"use client";

import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "./context/userSlice";
import { useSession } from "next-auth/react";
import Masonry from "react-masonry-css";
import RotatingText from './@/components/RotatingText/RotatingText';
import SkeletonMasonry from "./@/components/skeleton-post";

import { ComposerComment } from "./@/components/model-comment/ComposerComment";
import SkeletonPost from "./@/components/skeleton-post";
import { createPostSlug } from "./../lib/utils";
import TagCarousel from "./@/components/carousel-tag/tag-carousel";
import Herosection from "./@/components/background/hero-section"



const breakpointColumnsObj = { default: 6, 1024: 2, 640: 2 };

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const reduxUser = useSelector((state: any) => state.user?.user);
  const reduxPersist = useSelector((state: any) => state._persist);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<{ name: string; image: string }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  


  // Redirect user chưa onboard
  useEffect(() => {
    // Đợi Redux Persist rehydrate xong
    if (reduxPersist && !reduxPersist.rehydrated) {
      return;
    }
    
    // Đợi session load xong
    if (status === "loading") {
      return;
    }
    
    // Kiểm tra xem có đang ở onboarding page không
    if (window.location.pathname === '/onboarding') {
      return;
    }
    
    // Ưu tiên session onboarded status
    if (session?.user?.onboarded === true) {
      return;
    }
    
    // Nếu session không có onboarded, kiểm tra Redux
    if (!reduxUser) {
      return;
    }
    
    if (reduxUser.onboarded === false) {
      router.replace("/onboarding");
    }
  }, [reduxUser?.onboarded, reduxPersist?.rehydrated, session?.user?.onboarded, status, router]);

    // Fetch personalized feed
  useEffect(() => {
    const fetchFeed = async () => {
      // Đợi Redux Persist rehydrate xong
      if (reduxPersist && !reduxPersist.rehydrated) {
        return;
      }
      
      // Đợi session load xong
      if (status === "loading") {
        return;
      }
      
      // Ưu tiên session onboarded status
      if (session?.user?.onboarded === true) {
        // Nếu session onboarded nhưng không có Redux user, cần fetch user data
        if (!reduxUser) {
          // Fetch user data từ backend để có user ID
          try {
            const response = await fetch(`http://localhost:5001/api/users/email/${session.user.email}`);
            if (response.ok) {
              const userData = await response.json();
              
              // Dispatch user data vào Redux
              dispatch(updateUser(userData.user));
              
              // Tiếp tục với user ID mới
              const userId = userData.user.id;
              
              // Fetch feed với user ID từ backend
              const feedResponse = await axios.get(`http://localhost:5001/api/feed/${userId}`);
              
              const mapped = feedResponse.data.map((item: any) => ({
                ...item,
                slug: createPostSlug(item.title, item.id),
              }));
              
              const shuffledPosts = mapped.sort(() => Math.random() - 0.5);
              setPosts(shuffledPosts);
            } else {
              setPosts([]);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setPosts([]);
          } finally {
            setIsLoading(false);
          }
          return;
        }
      } else if (!reduxUser) {
        setIsLoading(false);
        return;
      } else if (reduxUser.onboarded !== true) {
        setIsLoading(false);
        return;
      }
      
      // Kiểm tra user ID có hợp lệ không
      if (!reduxUser?.id || typeof reduxUser.id !== 'number' || reduxUser.id <= 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(`http://localhost:5001/api/feed/${reduxUser.id}`);
        const mapped = res.data.map((item: any) => ({
          ...item,
          slug: createPostSlug(item.title, item.id),
        }));
        // Shuffle posts
        const shuffledPosts = mapped.sort(() => Math.random() - 0.5);

        setPosts(shuffledPosts);
      } catch (error) {
        console.error('Error fetching feed:', error);
        setPosts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeed();
  }, [reduxUser?.id, reduxUser?.onboarded, reduxPersist?.rehydrated, session?.user?.onboarded, status, dispatch]);

  // Compute popular tags
  useEffect(() => {
    if (!posts.length) return;
    const tagMap: Record<string, { count: number; images: string[] }> = {};

    posts.forEach((post) => {
      (post.tags || []).forEach((tag: string) => {
        if (tag.length > 3) {
          if (!tagMap[tag]) tagMap[tag] = { count: 0, images: [] };
          tagMap[tag].count += 1;
          if (post.image_url) tagMap[tag].images.push(post.image_url);
        }
      });
    });

    const sortedTags = Object.entries(tagMap)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        image: data.images[Math.floor(Math.random() * data.images.length)] || "/default.png",
      }))
      .slice(0, 15);

    // Shuffle tags
    const shuffledTags = sortedTags.sort(() => Math.random() - 0.5);

    setPopularTags(shuffledTags);
  }, [posts]);

  const handleDeletePost = async (postId: number) => {
    try {
      await axios.delete(`http://localhost:5001/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  return (
    <section className="mt-20 px-12">
      {/* Banner */}
      <Herosection 
        title="Turn your space into a reflection of your creativity"
        description="Personalize every detail and let your creativity define your profile."
      />

      {/* Filter & Tags */}
      <section className="w-full mt-12 flex flex-col gap-4">
        <TagCarousel
          tags={popularTags}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />
      </section>

      {/* Posts */}
      <section className="mt-6 pb-20">
        {isLoading ? (
          <SkeletonMasonry count={20} />
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-4"
            columnClassName="flex flex-col"
          >
            {filteredPosts.map((post) => (
              <ComposerComment
                key={post.id}
                post={post}
                currentUserId={reduxUser?.id}
                onDelete={handleDeletePost}
                relatedPosts={filteredPosts.filter((p) => p.id !== post.id)}
              />
            ))}
          </Masonry>
        )}
      </section>
    </section>
  );
}
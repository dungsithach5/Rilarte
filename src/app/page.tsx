"use client";

import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Masonry from "react-masonry-css";
import RotatingText from './@/components/RotatingText/RotatingText';
import { ComposerComment } from "./@/components/model-comment/ComposerComment";
import SkeletonPost from "./@/components/skeleton-post";
import { createPostSlug } from "./../lib/utils";
import TagCarousel from "./@/components/carousel-tag/tag-carousel";


const breakpointColumnsObj = { default: 6, 1024: 2, 640: 2 };

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: any) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<{ name: string; image: string }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 FeedPage Debug:', {
      reduxUser,
      hasUser: !!reduxUser,
      onboarded: reduxUser?.onboarded,
      userId: reduxUser?.id,
      userEmail: reduxUser?.email,
      userIdType: typeof reduxUser?.id,
      reduxUserKeys: reduxUser ? Object.keys(reduxUser) : 'No keys'
    });
    
    // Kiểm tra localStorage
    const localStorageUser = localStorage.getItem('persist:root');
    console.log('🔍 Redux Persist State:', localStorageUser ? JSON.parse(localStorageUser) : 'No persist state');
    
    // Kiểm tra NextAuth session
    const sessionToken = localStorage.getItem('next-auth.session-token');
    console.log('🔍 NextAuth Session Token:', sessionToken);
    
    // Restore onboarded status nếu có
    if (reduxUser?.email && reduxUser.onboarded === undefined) {
      const savedOnboarded = localStorage.getItem('user_onboarded');
      console.log('🔍 Checking for saved onboarded status:', savedOnboarded);
      if (savedOnboarded) {
        const { email, onboarded } = JSON.parse(savedOnboarded);
        console.log('🔍 Saved onboarded info:', { email, onboarded });
        if (email === reduxUser.email) {
          console.log('🔄 Restoring onboarded status:', onboarded);
          dispatch({ type: 'user/restoreOnboardedStatus', payload: { email, onboarded } });
        } else {
          console.log('❌ Email mismatch:', { savedEmail: email, currentEmail: reduxUser.email });
        }
      } else {
        console.log('❌ No saved onboarded status found - fetching from database');
        // Fetch onboarded status từ database nếu không có trong localStorage
        fetch(`http://localhost:5001/api/users/email/${reduxUser.email}`)
          .then(response => response.json())
          .then(data => {
            if (data.user && data.user.onboarded !== undefined) {
              console.log('🔄 Fetched onboarded status from database:', data.user.onboarded);
              dispatch({ type: 'user/restoreOnboardedStatus', payload: { 
                email: reduxUser.email, 
                onboarded: data.user.onboarded 
              }});
            }
          })
          .catch(error => console.error('❌ Error fetching onboarded status:', error));
      }
    }
  }, [reduxUser?.id, reduxUser?.onboarded, reduxUser?.email, dispatch]);

  // Redirect user chưa onboard
  useEffect(() => {
    if (!reduxUser) {
      console.log('❌ No redux user found');
      return;
    }
    if (reduxUser.onboarded === false) {
      console.log('🔄 Redirecting to onboarding');
      router.replace("/onboarding");
    }
  }, [reduxUser?.onboarded]);

  // Fetch personalized feed
  useEffect(() => {
    console.log('🔄 Fetching feed for user:', reduxUser?.id);
    
    if (!reduxUser) {
      console.log('❌ No redux user found');
      return;
    }
    
    // Nếu onboarded undefined, thử fetch user data từ backend
    if (reduxUser.onboarded === undefined && reduxUser.email) {
      console.log('🔄 Onboarded undefined, fetching user data from backend');
      axios
        .get(`http://localhost:5001/api/users/email/${reduxUser.email}`)
        .then((res) => {
          const backendUser = res.data.user;
          console.log('✅ Backend user data:', backendUser);
          
          if (backendUser.onboarded === true) {
            // User đã onboard, fetch feed
            fetchFeed(backendUser.id);
          } else {
            console.log('❌ User not onboarded, redirecting to onboarding');
            router.replace("/onboarding");
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching user data:', error);
        });
      return;
    }
    
    if (!reduxUser.onboarded) {
      console.log('❌ Cannot fetch feed:', { 
        hasUser: !!reduxUser, 
        onboarded: reduxUser?.onboarded 
      });
      return;
    }
    
    // Kiểm tra user ID có hợp lệ không
    if (!reduxUser.id || typeof reduxUser.id !== 'number' || reduxUser.id <= 0) {
      console.error('❌ Invalid user ID:', reduxUser.id);
      return;
    }
    
    fetchFeed(reduxUser.id);
  }, [reduxUser?.id, reduxUser?.onboarded, reduxUser?.email]);
  
  // Helper function để fetch feed
  const fetchFeed = useCallback((userId: number) => {
    axios
      .get(`http://localhost:5001/api/users/${userId}/feed`)
      .then((res) => {
        console.log('✅ Feed fetched successfully:', res.data.length, 'posts');
        const mapped = res.data.map((item: any) => ({
          ...item,
          slug: createPostSlug(item.title, item.id),
        }));
        // Shuffle posts
        const shuffledPosts = mapped.sort(() => Math.random() - 0.5);

        setPosts(shuffledPosts);
      })
      .catch((error) => {
        console.error('❌ Error fetching feed:', error);
      })
      .finally(() => setIsLoading(false));
  }, [setPosts, setIsLoading]);

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
    <section className="mt-20">
      {/* Banner */}
      <section className="w-full overflow-hidden">
        <div className="flex h-full flex-col px-14">
          <h1 className="font-bold leading-tight text-3xl flex flex-wrap items-center gap-2">
            Unleash your{" "}
            <RotatingText
              texts={["creative", "vivid", "pure", "real", "fluid", "cool", "artsy"]}
              mainClassName="px-2 sm:px-2 md:px-5 bg-black text-white overflow-hidden py-0.5 sm:py-1 md:py-1 justify-center rounded-xl"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2500}
            />
            energy
          </h1>
          <p className="text-sm md:text-lg text-gray-800">
            Step into a world where visuals speak and creativity knows no limits 
            <br />
            a space to express, inspire, and connect through art.
          </p>
        </div>
      </section>

      {/* Filter & Tags */}
      <section className="w-full px-14 mt-12 flex flex-col gap-4">
        <TagCarousel
          tags={popularTags}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />
      </section>

      {/* Posts */}
      <section className="px-14 mt-6 pb-20">
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
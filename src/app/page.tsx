"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Masonry from "react-masonry-css";
import RotatingText from './@/components/RotatingText/RotatingText';
import { ComposerComment } from "./@/components/model-comment/ComposerComment";
import SkeletonPost from "./@/components/skeleton-post";
import { createPostSlug } from "./../lib/utils";

const breakpointColumnsObj = { default: 6, 1024: 2, 640: 2 };

export default function FeedPage() {
  const router = useRouter();
  const reduxUser = useSelector((state: any) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Redirect user chưa onboard
  useEffect(() => {
    if (!reduxUser) return;
    if (reduxUser.onboarded === false) {
      router.replace("/onboarding");
    }
  }, [reduxUser, router]);

  // Fetch personalized feed
  useEffect(() => {
    if (!reduxUser || !reduxUser.onboarded) return;
    axios
      .get(`http://localhost:5001/api/users/${reduxUser.id}/feed`)
      .then((res) => {
        const mapped = res.data.map((item: any) => ({
          ...item,
          slug: createPostSlug(item.title, item.id),
        }));
        // Shuffle posts
        const shuffledPosts = mapped.sort(() => Math.random() - 0.5);

        setPosts(shuffledPosts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [reduxUser]);

  // Compute popular tags
  useEffect(() => {
    if (!posts.length) return;
    const tagCount: Record<string, number> = {};
    posts.forEach((post) => {
      (post.tags || []).forEach((tag: string) => {
        if (tag.length > 3) tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 16);

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
        <div className="flex h-full flex-col px-6 justify-center items-center">
          <h1 className="font-bold leading-tight text-4xl flex flex-wrap items-center gap-2">
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
          <p className="text-sm md:text-xl text-gray-800 text-center">
            Step into a world where visuals speak and creativity knows no limits 
            <br />
            a space to express, inspire, and connect through art.
          </p>
        </div>
      </section>

      {/* Filter & Tags */}
      <section className="w-full px-14 mt-12 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 w-auto">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-4 py-2 rounded-full border text-sm font-medium shadow-sm transition-colors
                  ${tag === selectedTag
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-black hover:text-white border-gray-300"}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
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
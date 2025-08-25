"use client";

import API from "../services/Api";
import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { Frown } from "lucide-react";
import RotatingText from '../@/components/RotatingText/RotatingText';
import { useSearchParams } from "next/navigation";
import { fetchPosts, fetchPostsByColor } from "../services/Api/posts";
import HeroSection from "../@/components/background/hero-section";
import { fetchBannedKeywords } from "../services/Api/bannedKeywords";
import { createPostSlug } from "../../lib/utils";
import { ComposerComment } from "../@/components/model-comment/ComposerComment";
import SkeletonPost from "../@/components/skeleton-post";
import { useAuth } from "../hooks/useAuth";
import Tagcarousel from "../@/components/carousel-tag/tag-carousel";

const breakpointColumnsObj = { default: 6, 1024: 2, 640: 2 };

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams?.get("search") || "";
  const searchColor = searchParams?.get("color") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [bannedKeywords, setBannedKeywords] = useState<string[]>([]);
  const [violation, setViolation] = useState(false);
  const { user, session } = useAuth(true);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load banned keywords
  useEffect(() => {
    fetchBannedKeywords()
      .then(setBannedKeywords)
      .catch(console.error);
  }, []);

  // Fetch posts by keyword or color
  useEffect(() => {
    const keyword = searchKeyword;
    const color = searchColor;

    const foundViolation = keyword && bannedKeywords.some((word) =>
      keyword.toLowerCase().includes(word)
    );

    if (foundViolation) {
      setViolation(true);
      setPosts([]);
      return;
    }

    setIsLoading(true);

    const fetcher = color ? fetchPostsByColor : fetchPosts;
    const param = color || keyword;

    fetcher(param)
      .then((data) => {
        const mapped = data.map((item: any) => ({
          ...item,
          slug: `/post/${createPostSlug(item.title, item.id)}`,
        }));

        // Shuffle posts
        const shuffledPosts = mapped.sort(() => Math.random() - 0.5);

        setPosts(shuffledPosts);
        setViolation(false);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchKeyword, searchColor, bannedKeywords, user]);

  // Popular tags
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
      .slice(0, 15);

    // Shuffle tags
    const shuffledTags = sortedTags.sort(() => Math.random() - 0.5);

    setPopularTags(shuffledTags);
  }, [posts]);

  const handleDeletePost = async (postId: number) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  return (
    <section className="mt-20">
      {/* Hero Section */}
      <section className="w-full overflow-hidden">
        <div className="flex h-full flex-col px-14">
          <h1 className="font-bold leading-tight text-2xl flex flex-wrap items-center gap-2">
            Explore your{" "}
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
          <p className="text-lg md:text-xl text-gray-800">
            Discover new visuals, trending topics, and inspirations across the platform.
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
        {violation ? (
          <div className="mt-12 text-center w-full flex justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-6">
              <Frown className="text-gray-400" size={120} />
              <div>
                The topic you are looking for violates our <strong>Community Guidelines</strong>, 
                <br />so we are currently unable to display the search results.
              </div>
            </div>
          </div>
        ) : isLoading ? (
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
                currentUserId={session?.user?.id ? Number(session.user.id) : undefined}
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

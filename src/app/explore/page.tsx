"use client";

import API from "../services/Api";
import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Frown } from "lucide-react";
import RotatingText from "../@/components/RotatingText/RotatingText";
import { useSearchParams } from "next/navigation";
import { fetchBannedKeywords } from "../services/Api/bannedKeywords";
import { createPostSlug } from "../../lib/utils";
import { ComposerComment } from "../@/components/model-comment/ComposerComment";
import SkeletonMasonry from "../@/components/skeleton-post";
import { useAuth } from "../hooks/useAuth";
import TagCarousel from "../@/components/carousel-tag/tag-carousel";

const breakpointColumnsObj = { default: 6, 1024: 2, 640: 2 };

interface Post {
  id: number;
  title: string;
  tags?: string[];
  image_url?: string;
  slug: string;
  [key: string]: any;
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams?.get("search") || "";
  const searchColor = searchParams?.get("color") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bannedKeywords, setBannedKeywords] = useState<string[]>([]);
  const [violation, setViolation] = useState(false);
  const { user } = useAuth(true);
  const [popularTags, setPopularTags] = useState<{ name: string; image: string }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load banned keywords
  useEffect(() => {
    fetchBannedKeywords()
      .then(setBannedKeywords)
      .catch((error) => {
        console.error("Error fetching banned keywords:", error);
        setBannedKeywords([]);
      });
  }, []);

  // Fetch posts (cursor-based)
  const fetchMorePosts = async (reset = false) => {
    try {
      if (reset) setCursor(null);

      const query = new URLSearchParams();
      query.set("limit", "20");
      if (cursor && !reset) query.set("cursor", cursor);
      if (searchKeyword) query.set("search", searchKeyword);
      if (searchColor) query.set("color", searchColor);

      const res = await API.get(`/posts?${query.toString()}`);
      const data = res.data;

      if (!data?.edges || data.edges.length === 0) {
        setHasMore(false);
        return;
      }

      const newPosts: Post[] = data.edges.map((e: any) => ({
        ...e.node,
        slug: `/post/${createPostSlug(e.node.title, e.node.id)}`,
      }));

      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));

      // Update cursor & hasMore
      setCursor(data.pageInfo?.endCursor || null);
      setHasMore(data.pageInfo?.hasNextPage ?? newPosts.length === 20);

      setViolation(false);
    } catch (error: any) {
      if (error?.response) {
        console.error("API Error Response:", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });
      } else if (error?.request) {
        console.error("API No Response:", error.request);
      } else {
        console.error("API Error:", error?.message || error);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load or when search changes
  useEffect(() => {
    if (searchKeyword) {
      const foundViolation = bannedKeywords.some((word) =>
        searchKeyword.toLowerCase().includes(word)
      );
      if (foundViolation) {
        setViolation(true);
        setPosts([]);
        setHasMore(false);
        return;
      }
    }

    setIsLoading(true);
    setCursor(null);
    setHasMore(true);
    fetchMorePosts(true);
  }, [searchKeyword, searchColor, bannedKeywords]);

  // Popular tags
  useEffect(() => {
    if (!posts.length) return;
    const tagMap: Record<string, { count: number; images: string[] }> = {};

    posts.forEach((post) => {
      const tags = post.tags || [];
      if (Array.isArray(tags)) {
        tags.forEach((tag: string) => {
          if (tag && tag.length > 3) {
            if (!tagMap[tag]) tagMap[tag] = { count: 0, images: [] };
            tagMap[tag].count += 1;
            if (post.image_url) tagMap[tag].images.push(post.image_url);
          }
        });
      }
    });

    const sortedTags = Object.entries(tagMap)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        image: data.images.length > 0
          ? data.images[Math.floor(Math.random() * data.images.length)]
          : "/default.png",
      }))
      .slice(0, 15);

    setPopularTags(sortedTags.sort(() => Math.random() - 0.5));
  }, [posts]);

  const handleDeletePost = async (postId: number) => {
    try {
      await API.delete(`/posts/${postId}`);
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
      {/* Hero Section */}
      <section className="w-full overflow-hidden">
        <div className="flex h-full flex-col">
          <h1 className="font-bold leading-tight text-3xl flex flex-wrap items-center gap-2">
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
          <p className="text-sm md:text-lg text-gray-800">
            Discover new visuals, trending topics, and inspirations across the platform.
          </p>
        </div>
      </section>

      {/* Filter & Tags */}
      <section className="w-full mt-12 flex flex-col gap-4 overflow-x-hidden">
        <TagCarousel
          tags={popularTags}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />
      </section>

      {/* Posts */}
      <section className="mt-4 pb-20">
        {violation ? (
          <div className="mt-12 text-center w-full flex justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-6">
              <Frown className="text-gray-400" size={120} />
              <div>
                The topic you are looking for violates our <strong>Community Guidelines</strong>,
                <br />
                so we are currently unable to display the search results.
              </div>
            </div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredPosts.length}
            next={() => fetchMorePosts(false)}
            hasMore={hasMore}
            loader={<SkeletonMasonry count={20} />}
            endMessage={
              <p className="text-center py-4 text-gray-500">
                You have seen it all 👀
              </p>
            }
          >
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-4"
              columnClassName="flex flex-col"
            >
              {filteredPosts.map((post) => (
                <ComposerComment
                  key={post.id}
                  post={post}
                  currentUserId={user?.id ? Number(user.id) : undefined}
                  onDelete={handleDeletePost}
                  relatedPosts={filteredPosts.filter((p) => p.id !== post.id)}
                />
              ))}
            </Masonry>
          </InfiniteScroll>
        )}
      </section>
    </section>
  );
}

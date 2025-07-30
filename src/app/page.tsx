"use client";

import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { Search,Frown, MoreVertical } from "lucide-react";
import RotatingText from './@/components/RotatingText/RotatingText'

import { fetchPosts } from "./services/Api/posts";
import { fetchBannedKeywords } from "./services/Api/bannedKeywords";

import { ComposerComment } from "./@/components/model-comment/ComposerComment";
import SkeletonPost from "./@/components/skeleton-post";
import { useAuth } from "./hooks/useAuth";
import axios from "axios";

const breakpointColumnsObj = {
  default: 6,
  1024: 2,
  640: 2,
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [bannedKeywords, setBannedKeywords] = useState<string[]>([]);
  const [violation, setViolation] = useState(false);
  const { user, session, status } = useAuth(true);
  

  // Load banned keywords once
  useEffect(() => {
    const loadBanned = async () => {
      try {
        const words = await fetchBannedKeywords();
        setBannedKeywords(words);
      } catch (err) {
        console.error("Error loading banned keywords", err);
      }
    };
    loadBanned();
  }, []);

  // Load default posts on first load
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts("");
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: user?.username || user?.name,
          title: item.title,
          content: item.content,
          image_url: item.image_url,
        }));
        setPosts(mapped);
      } catch (err) {
        console.error("Error loading posts", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim().toLowerCase();

    // Check violation
    const foundViolation = bannedKeywords.some((word) =>
      keyword.includes(word)
    );
    if (foundViolation) {
      setViolation(true);
      setPosts([]);
      return;
    }

    setViolation(false);
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const data = await fetchPosts(keyword);
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: user?.username || user?.name,
          title: item.title,
          content: item.content,
          image_url: item.image_url,
        }));
        setPosts(mapped);
      } catch (err) {
        console.error("Error fetching posts", err);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  // delete post
  const handleDeletePost = async (postId: number) => {
    try {
              await axios.delete(`http://localhost:5001/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  return (
    <section>
      {/* Banner */}
      <section className="w-full overflow-hidden">
        <div className="flex h-full flex-col px-6">
          <h1
            className="font-bold leading-tight text-[clamp(2.5rem,10vw,8rem)] flex flex-wrap items-center gap-2"
          >
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

          <p className="text-lg md:text-xl text-gray-800">
            Step into a world where visuals speak and creativity knows no limits 
            <br/>
             a space to express, inspire, and connect through art.
          </p>
        </div>
      </section>


      {/* Search & Filter */}
      <section className="w-full px-6 mt-12 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-1/3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="w-full p-3 px-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2C343A]"
              />
              <button
                type="submit"
                className="absolute h-10 w-10 bg-black rounded-full flex justify-center items-center top-1/2 right-1 -translate-y-1/2 text-white cursor-pointer"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <div className="w-auto">
            <select className="p-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C343A]">
              <option value="popular">Popular</option>
              <option value="following">Following</option>
            </select>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="px-6 mt-6 pb-20">
        {violation ? (
          <div className="mt-12 text-center w-full flex justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-6">
              <Frown className="text-gray-400" size={120}/>
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
            {posts.map((post) => (
              <ComposerComment
                key={post.id}
                post={post}
                currentUserId={session?.user?.id ? Number(session.user.id) : undefined}
                onDelete={handleDeletePost}
              />
            ))}
          </Masonry>
        )}
      </section>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { Search,Frown } from "lucide-react";

import { fetchPosts } from "./services/Api/posts";
import { fetchBannedKeywords } from "./services/Api/bannedKeywords";

import { ComposerComment } from "./@/components/model-comment/ComposerComment";
import SkeletonPost from "./@/components/skeleton-post";
import { useAuth } from "./hooks/useAuth";

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
  const { user } = useAuth(true);

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
          text: item.content,
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
          text: item.content,
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

  return (
    <section>
      {/* Banner */}
      <section>
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Unleash Your Creativity <br /> One Image at a Time
          </h1>
          <p className="text-lg text-gray-600">
            Step into a world where visuals speak louder than words — a place to explore <br /> share, and get lost in the boundless beauty of creative freedom.
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
              <ComposerComment key={post.id} post={post} />
            ))}
          </Masonry>
        )}
      </section>
    </section>
  );
}

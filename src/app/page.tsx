"use client"

import axios from 'axios'
import Masonry from "react-masonry-css";
import { Search } from "lucide-react";
import { ComposerComment } from "./@/components/model-comment/ComposerComment"
import { useEffect, useState } from "react";
import SkeletonPost from "./@/components/skeleton-post"

const breakpointColumnsObj = {
  default: 6,
  1024: 2,
  640: 2,
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        const mappedPosts = res.data.map((item: any) => ({
          id: item.id,
          name: item.user_name,
          text: item.content,
          image_url: item.image_url
        }));
        setPosts(mappedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

      {/* Search & Filter section */}
      <section className="w-full px-6 mt-12 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-1/3">
            <form action="" className="relative">
              <input
                type="text"
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

          {/* Filter Dropdown */}
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
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonPost key={i} />)
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

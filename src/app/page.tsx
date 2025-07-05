"use client"

import Image from "next/image";
import { Search } from "lucide-react";
import { ComposerComment } from "./@/components/model-comment/ComposerComment"
const posts = [
  {
    id: 1,
    name: "Anna Smith",
    time: "2 hours ago",
    text: "Enjoying a quiet afternoon 🌿",
    image: "https://images.unsplash.com/photo-1659959103870-c4beea371a9b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
  },
  {
    id: 2,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1747767763480-a5b4c7a82aef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8",
  },
  {
    id: 3,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvbG9yfGVufDB8MXwwfHx8MA%3D%3D",
  },
    {
    id: 4,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1751209978666-c1007795154e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyOHx8fGVufDB8fHx8fA%3D%3D",
  },
    {
    id: 5,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1748392029321-58793571f850?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMHx8fGVufDB8fHx8fA%3D%3D",
  },
    {
    id: 6,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1749497683202-d3073573d996?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMXx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1750711642160-efc6e052751a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzOHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 8,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1743623173827-45535f2173a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1MHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 9,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1750636032555-87ff65188516?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2M3x8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 10,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1750174549347-2a3f92753738?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2Nnx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 11,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1750174549347-2a3f92753738?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2Nnx8fGVufDB8fHx8fA%3D%3D",
  },
];
export default function Home() {
  return (
    <div>
      {/* Banner */}
      <section>
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Unleash Your Creativity <br /> One Image at a Time</h1>
          <p className="text-lg text-gray-600">Step into a world where visuals speak louder than words — a place to explore <br /> share, and get lost in the boundless beauty of creative freedom.</p>
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
      
      {/* Post */}
      <section className="px-6 mt-6 columns-1 sm:columns-2 md:columns-5 gap-4">
        {posts.map((post) => (
          <div key={post.id}>
            <ComposerComment post={post} />
          </div>
        ))}
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/tabs";
import { ComposerComment } from "./model-comment/ComposerComment";
import SkeletonPost from "./skeleton-post"

const posts = [
  {
    id: 1,
    name: "Anna Smith",
    time: "2 hours ago",
    text: "Enjoying a quiet afternoon 🌿",
    image:
      "https://images.unsplash.com/photo-1659959103870-c4beea371a9b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
  },
  {
    id: 2,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image:
      "https://images.unsplash.com/photo-1747767763480-a5b4c7a82aef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8",
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
    image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvbG9yfGVufDB8MXwwfHx8MA%3D%3D",
  },
  {
    id: 5,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvbG9yfGVufDB8MXwwfHx8MA%3D%3D",
  },
  {
    id: 6,
    name: "John Doe",
    time: "1 hour ago",
    text: "Check out this amazing sunset!",
    image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvbG9yfGVufDB8MXwwfHx8MA%3D%3D",
  },
];

export default function ProfileTabs() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Tabs defaultValue="post" className="mt-6 px-6">
      <TabsList className="mx-auto space-x-80 border-b border-white/10 bg-transparent">
        <TabsTrigger value="post">Post</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
      </TabsList>

      <TabsContent
        value="post"
        className="px-6 mt-6 columns-1 sm:columns-2 md:columns-5 gap-4 pb-28"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonPost key={i} />)
          : posts.map((post) => (
              <div key={post.id}>
                <ComposerComment post={post} />
              </div>
            ))}
      </TabsContent>
      {/* Following */}
      <TabsContent value="following" className="mt-6 mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://ui.shadcn.com/avatars/01.png"
              alt="Avatar"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Sofia Davis</span>
            <span className="text-gray-500 text-sm">m@example.com</span>
          </div>
          <button className="ml-auto flex items-center border border-gray-300 rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100 transition cursor-pointer">
            Follow
          </button>
        </div>
      </TabsContent>

      <TabsContent value="followers" className="mt-6 mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://ui.shadcn.com/avatars/01.png"
              alt="Avatar"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">John Dofe</span>
            <span className="text-gray-500 text-sm">m@example.com</span>
          </div>
          <button className="ml-auto flex items-center border border-gray-300 rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100 transition cursor-pointer">
            Follow
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

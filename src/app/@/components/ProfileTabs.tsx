import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/tabs';
import BentoGrid from "./post/BentoGrid";

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
    image: "/img/Modern Conference Room.jpeg",
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

export default function ProfileTabs() {
  return (
    <Tabs defaultValue="post" className="mt-6 px-6">
      <TabsList className="mx-auto space-x-80 border-b border-white/10 bg-transparent">
        <TabsTrigger
          value="post"
          className=""
        >
          Post
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className=""
        >
          Following
        </TabsTrigger>
        <TabsTrigger
          value="followers"
          className=""
        >
          Followers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="post" className="mt-6">
        <BentoGrid posts={posts} />
      </TabsContent>

      <TabsContent value="following" className="mt-6 mx-auto">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
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
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://ui.shadcn.com/avatars/01.png"
              alt="Avatar"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-medium text-sm">Jogn Dofe</span>
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

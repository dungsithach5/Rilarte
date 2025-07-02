import React from "react";
import PostItem from "../post/PostItem";

interface Post {
  id: number;
  name: string;
  time: string;
  text: string;
  image: string;
}

interface BentoGridProps {
  posts: Post[];
}

const BentoGrid: React.FC<BentoGridProps> = ({ posts }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-5 gap-4">
    {posts.map((post) => (
        <div key={post.id} className="mb-4 break-inside-avoid">
        <PostItem {...post} />
        </div>
    ))}
    </div>
  );
};

export default BentoGrid;
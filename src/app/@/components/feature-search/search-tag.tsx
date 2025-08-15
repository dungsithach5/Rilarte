"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface SearchTagsProps {
  onSelectTag: (tag: string) => void;
}

export default function SearchTags({ onSelectTag }: SearchTagsProps) {
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    async function loadPopularTags() {
      try {
        const res = await axios.get("http://localhost:5001/api/posts");
        const posts = res.data;

        const tagCount: Record<string, number> = {};
        posts.forEach((post: any) => {
          (post.tags || []).forEach((tag: string) => {
            if (tag.length > 0) {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            }
          });
        });

        const sortedTags = Object.entries(tagCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag);

        setPopularTags(sortedTags);
      } catch (err) {
        console.error("Error fetching posts for tags", err);
      }
    }

    loadPopularTags();
  }, []);

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {popularTags.map((tag) => (
        <span
          key={tag}
          className="bg-[#3a3a3a] text-[#e0e0e0] px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-[#4a4a4a]"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelectTag(tag);
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

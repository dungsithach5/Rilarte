"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
}

export default function SearchInput({ onSearch, initialKeyword = "" }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(initialKeyword);

  useEffect(() => {
    setInputValue(initialKeyword);
  }, [initialKeyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search artworks..."
        className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black rounded-full h-8 w-8 flex items-center justify-center"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

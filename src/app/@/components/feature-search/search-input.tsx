"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { fetchColors } from "../../../services/Api/posts";

interface SearchInputProps {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
}

export default function SearchInput({ onSearch, initialKeyword = "" }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(initialKeyword);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    async function loadColors() {
      try {
        const data = await fetchColors();
        setColors(data);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    }
    loadColors();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const trendingTags: string[] = [
    '#nature',
    'textile art',
    'packaging',
    'art',
    'ceramics',
  ];

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div>
        <input
          type="text"
          placeholder="Search artworks..."
          className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black rounded-full h-8 w-8 flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute top-12 z-10 border bg-white rounded-lg p-5 text-[#e0e0e0] shadow-lg border-t border-[#3a3a3a]">
          <h3 className="text-black text-sm uppercase mb-4 tracking-wider">
            Trending
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {trendingTags.map((tag) => (
              <span
                key={tag}
                className="bg-[#3a3a3a] text-[#e0e0e0] px-4 py-2 rounded-full text-sm flex items-center cursor-pointer hover:bg-[#4a4a4a] transition-colors duration-200"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputValue(tag);
                  onSearch(tag);
                  setShowSuggestions(false);
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-black text-sm uppercase mb-4 tracking-wider">
            Colors
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            {colors.length > 0 ? (
              colors.map((colorCode) => (
                <React.Fragment key={colorCode}>
                  <span
                    className="w-8 h-8 rounded-full border border-gray-700 cursor-pointer transform hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: colorCode }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setInputValue(colorCode);
                      onSearch(colorCode);
                      setShowSuggestions(false);
                    }}
                  ></span>
                  <span
                    className="bg-[#3a3a3a] text-[#e0e0e0] px-3 py-1 rounded text-xs cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setInputValue(colorCode);
                      onSearch(colorCode);
                      setShowSuggestions(false);
                    }}
                  >
                    {colorCode}
                  </span>
                </React.Fragment>
              ))
            ) : (
              <p className="text-gray-500 text-xs">Loading colors...</p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

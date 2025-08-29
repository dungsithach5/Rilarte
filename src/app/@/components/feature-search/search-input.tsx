// SearchInput.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { fetchColors } from "../../../services/Api/posts";
import UserSearchResults from "./search-user";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
}

export default function SearchInput({ onSearch, initialKeyword = "" }: SearchInputProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialKeyword);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load colors
  useEffect(() => {
    const loadColors = async () => {
      try {
        const data = await fetchColors();
        setColors(data);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };
    loadColors();
  }, []);

  // Click outside to close both suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowColorSuggestions(false);
        setShowUserSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      onSearch?.(inputValue.trim());
      setShowColorSuggestions(false);
      setShowUserSuggestions(false);
      router.push(`/explore?search=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === "") {
      setShowColorSuggestions(true);
      setShowUserSuggestions(false);
    } else {
      setShowColorSuggestions(false);
      setShowUserSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.trim() === "") {
      setShowColorSuggestions(true);
    } else {
      setShowUserSuggestions(true);
    }
  };

  const handleSelectColor = (color: string) => {
    setInputValue(color);
    setShowColorSuggestions(false);
    setShowUserSuggestions(false);
    router.push(`/explore?color=${encodeURIComponent(color)}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Search Elarte..."
            className="w-full rounded-full bg-gray-100 px-6 py-2 pr-10"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black/50 rounded-full h-8 w-8 flex items-center justify-center"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </form>

      {/* Color Suggestions */}
      {showColorSuggestions && (
        <div className="absolute top-14 z-10 border bg-white rounded-lg p-5 shadow-lg w-full">
          <h3 className="text-black text-sm mb-4">Colors</h3>
          <div className="my-4 overflow-x-auto flex gap-3 scrollbar-none">
            {colors.length > 0 ? (
              colors.map((colorCode) => (
                <div key={colorCode} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <span
                    className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 hover:border-gray-500 transition-all duration-200"
                    style={{ backgroundColor: colorCode }}
                    onClick={() => handleSelectColor(colorCode)}
                    title={colorCode}
                  />
                  <span
                    className="bg-gray-200 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => handleSelectColor(colorCode)}
                  >
                    {colorCode}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">Loading colors...</p>
            )}
          </div>
        </div>
      )}

      {/* User Search */}
      {showUserSuggestions && inputValue.trim() !== "" && (
        <UserSearchResults
          keyword={inputValue}
          onSelect={(user) => {
            setInputValue(user.username);
            setShowUserSuggestions(false);
            router.push(`/profile/${user.id}`);
          }}
        />
      )}
    </div>
  );
}

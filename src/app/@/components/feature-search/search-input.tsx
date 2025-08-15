"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchColors } from "../../../services/Api/posts";
import UserSearchResults from "./search-user";
import SearchTags from "./search-tag";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setKeyword } from "../../../context/searchSlice";

export default function SearchInput() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  // Load colors for suggestion box
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

  // Submit search form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      dispatch(setKeyword(inputValue.trim()));
      setShowSuggestions(false);
    }
  };

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim() === "");
  };

  const handleInputFocus = () => {
    if (inputValue.trim() === "") setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  // Click tag => set input & dispatch keyword
  const handleSelectTag = (tag: string) => {
    setInputValue(tag);
    dispatch(setKeyword(tag));
    setShowSuggestions(false);
  };

  // Click color => set input & dispatch keyword
  const handleSelectColor = (color: string) => {
    setInputValue(color);
    dispatch(setKeyword(color));
    setShowSuggestions(false);
  };

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

      {/* Suggestions */}
      {showSuggestions && inputValue.trim() === "" && (
        <div className="absolute top-12 z-10 border bg-white rounded-lg p-5 shadow-lg w-full">
          {/* Trending Tags */}
          <h3 className="text-black text-sm uppercase mb-4 tracking-wider">Trending Tags</h3>
          <SearchTags onSelectTag={handleSelectTag} />

          {/* Colors */}
          <h3 className="text-black text-sm uppercase mb-4 tracking-wider">Colors</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            {colors.length > 0 ? (
              colors.map((colorCode) => (
                <React.Fragment key={colorCode}>
                  <span
                    className="w-8 h-8 rounded-full border border-gray-700 cursor-pointer hover:scale-110"
                    style={{ backgroundColor: colorCode }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectColor(colorCode);
                    }}
                  ></span>
                  <span
                    className="bg-[#3a3a3a] text-[#e0e0e0] px-3 py-1 rounded text-xs cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectColor(colorCode);
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

      {/* User search */}
      {inputValue.trim() !== "" && (
        <UserSearchResults
          keyword={inputValue}
          onSelect={(user) => {
            setInputValue(user.username);
            dispatch(setKeyword(user.username));
            router.push(`/profile/${user.id}`);
            setShowSuggestions(false);
          }}
        />
      )}
    </form>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { fetchColors } from "../../../services/Api/posts";
import UserSearchResults from "./search-user";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setKeyword } from "../../../context/searchSlice";

interface SearchInputProps {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
}

export default function SearchInput({ onSearch, initialKeyword = "" }: SearchInputProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState(initialKeyword);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  
  // Drag scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      dispatch(setKeyword(inputValue.trim()));
      onSearch?.(inputValue.trim());
      setShowSuggestions(false);
      router.push(`/explore?search=${encodeURIComponent(inputValue.trim())}`);
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
    if (isDragging) return;
    setTimeout(() => {
      if (!isDragging) {
        setShowSuggestions(false);
      }
    }, 100);
  };

  const handleSelectColor = (color: string) => {
    setInputValue(color);
    dispatch(setKeyword(color));
    setShowSuggestions(false);
    router.push(`/explore?color=${encodeURIComponent(color)}`);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setDragStartTime(Date.now());
    setHasMoved(false);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setHasMoved(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setHasMoved(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const deltaX = Math.abs(x - startX);
    
    if (deltaX > 5) {
      setHasMoved(true);
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleColorClick = (e: React.MouseEvent, colorCode: string) => {
    e.stopPropagation();
    e.preventDefault();
    const timeDiff = Date.now() - dragStartTime;
    if (hasMoved || timeDiff > 200) {
      return;
    }
    
    handleSelectColor(colorCode);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div>
        <input
          type="text"
          placeholder="Search Elarte..."
          className="w-full rounded-full bg-gray-100 px-6 py-3 pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black/50 rounded-full h-8 w-8 flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && inputValue.trim() === "" && (
        <div className="absolute top-14 z-10 border bg-white rounded-lg p-5 shadow-lg w-full">
          {/* Colors */}
          <h3 className="text-black text-sm uppercase mb-4 tracking-wider">
            Colors
          </h3>
          
          <div className="my-4">
            {colors.length > 0 ? (
              <div 
                ref={scrollRef}
                className="overflow-x-auto overflow-y-hidden scrollbar-none cursor-grab select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onFocus={(e) => e.preventDefault()}
              >
                <div className="flex gap-3 pb-2 min-w-max">
                  {colors.map((colorCode) => (
                    <div
                      key={colorCode}
                      className="flex flex-col items-center gap-2 flex-shrink-0 pointer-events-none"
                    >
                      <span
                        className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 hover:border-gray-500 transition-all duration-200 pointer-events-auto"
                        style={{ backgroundColor: colorCode }}
                        onMouseDown={(e) => handleColorClick(e, colorCode)}
                        title={colorCode}
                      ></span>
                      <span
                        className="bg-gray-200 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors duration-200 pointer-events-auto"
                        onMouseDown={(e) => handleColorClick(e, colorCode)}
                      >
                        {colorCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
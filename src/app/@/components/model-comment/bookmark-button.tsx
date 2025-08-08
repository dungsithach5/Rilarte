"use client"

import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid"

interface BookmarkButtonProps {
  bookmarked: boolean
  onToggle: (e: React.MouseEvent) => void
}

export default function BookmarkButton({ bookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(e)
      }}
      className={`transition-colors cursor-pointer ${
        bookmarked ? "text-black" : "text-gray-500 hover:text-black"
      }`}
    >
      {bookmarked ? (
        <BookmarkSolid className="w-6 h-6" />
      ) : (
        <BookmarkOutline className="w-6 h-6" />
      )}
    </button>
  )
}

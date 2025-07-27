"use client"

import { motion } from "framer-motion"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"

interface LikeButtonProps {
  liked: boolean
  likeCount: number
  onToggle: (e: React.MouseEvent) => void
}

export default function LikeButton({ liked, likeCount, onToggle }: LikeButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(e)
      }}
      className={`transition-colors cursor-pointer flex items-center gap-2 ${
        liked ? "text-red-500" : "hover:text-red-500"
      }`}
    >
      <motion.span
        key={liked ? "solid" : "outline"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {liked ? (
          <HeartSolid className="w-6 h-6" />
        ) : (
          <HeartOutline className="w-6 h-6" />
        )}
      </motion.span>
      <span>{likeCount}</span>
    </button>
  )
}

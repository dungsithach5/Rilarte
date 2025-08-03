"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { likeComment, unlikeComment, checkUserLikeComment } from "../../../services/Api/commentLikes"
import { useAuth } from "../../../hooks/useAuth"

interface CommentLikeButtonProps {
  commentId: number
  initialLikeCount?: number
  className?: string
}

export default function CommentLikeButton({ commentId, initialLikeCount = 0, className = "" }: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const { session } = useAuth()

  // Check if user is logged in
  const isAuthenticated = !!session?.user

  useEffect(() => {
    if (isAuthenticated) {
      checkUserLikeStatus()
    }
  }, [commentId, isAuthenticated])

  const checkUserLikeStatus = async () => {
    try {
      const response = await checkUserLikeComment(commentId)
      setLiked(response.isLiked)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      alert('Please login to like comments')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      if (liked) {
        await unlikeComment(commentId)
        setLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await likeComment(commentId)
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert state on error
      setLiked(!liked)
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`transition-colors cursor-pointer flex items-center gap-1 ${
        liked ? "text-red-500" : "hover:text-red-500"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <motion.span
        key={liked ? "solid" : "outline"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {liked ? (
          <HeartSolid className="w-4 h-4" />
        ) : (
          <HeartOutline className="w-4 h-4" />
        )}
      </motion.span>
      {likeCount > 0 && (
        <span className="text-xs font-medium">{likeCount}</span>
      )}
    </button>
  )
} 
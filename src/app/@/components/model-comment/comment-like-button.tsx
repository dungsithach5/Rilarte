"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { likeComment, unlikeComment, checkUserLikeComment, getCommentLikes } from "../../../services/Api/commentLikes"
import { useAuth } from "../../../hooks/useAuth"
import { useSelector } from "react-redux"

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
  const reduxUser = useSelector((state: any) => state.user.user)

  // Check if user is logged in (NextAuth or Redux)
  const isAuthenticated = !!(session?.user || reduxUser)
  
  // Debug log
  console.log('CommentLikeButton - Auth check:', {
    sessionUser: !!session?.user,
    reduxUser: !!reduxUser,
    isAuthenticated
  })

  useEffect(() => {
    // Fetch initial like count and user like status
    fetchLikeData()
  }, [commentId, isAuthenticated])

  const fetchLikeData = async () => {
    try {
      // Fetch like count
      const likesResponse = await getCommentLikes(commentId)
      console.log(`Comment ${commentId} likes:`, likesResponse)
      setLikeCount(likesResponse.count || 0)
      
      // Check if user liked (only if authenticated)
      if (isAuthenticated) {
        const userLikeResponse = await checkUserLikeComment(commentId)
        setLiked(userLikeResponse.isLiked)
      }
    } catch (error) {
      console.error('Error fetching like data:', error)
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
      } else {
        await likeComment(commentId)
        setLiked(true)
      }
      
      // Refresh like count from server
      const likesResponse = await getCommentLikes(commentId)
      setLikeCount(likesResponse.count || 0)
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert liked state on error
      setLiked(!liked)
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
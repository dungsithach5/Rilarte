"use client"

import Masonry from "react-masonry-css"
import DropdownMenuEllipsis from "../dropdown-ellipsis"
import Link from "next/link"
import LikeButton from "./like-button"
import BookmarkButton from "./bookmark-button"
import React from "react"

const breakpointColumnsObj = {
  default: 4,
  1024: 2,
  640: 2,
}

type RelatedPostsProps = {
  relatedPosts: any[]
  currentUserId?: number
  onDelete?: (id: number) => void
  userAvatar: string
  userName: string
  liked: boolean
  likeCount: number
  handleLikeToggle: (e: React.MouseEvent) => void
  bookmarked: boolean
  setBookmarked: React.Dispatch<React.SetStateAction<boolean>>
  isOwner: boolean
  onSelectPost: (post: any) => void
  currentPostId: number | string
}

export default function RelatedPosts({
  relatedPosts,
  currentUserId,
  onDelete,
  userAvatar,
  userName,
  liked,
  likeCount,
  handleLikeToggle,
  bookmarked,
  setBookmarked,
  isOwner,
  onSelectPost,
  currentPostId,
}: RelatedPostsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  return (
    <div className="mt-8 w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="flex flex-col gap-4"
      >
        {relatedPosts.map((post) => {
          const isCurrent = post.id === currentPostId

          return (
            <div
              key={post.id}
              onClick={() => {
                if (!isCurrent) onSelectPost(post)
              }}
              className={`relative group cursor-pointer 
                ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title={isCurrent ? "This post is already open" : undefined}
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-sm cursor-pointer hover:opacity-80 transition-all"
              />
              <div
                className={`absolute inset-0 bg-black/30 rounded-lg transition-opacity duration-300 flex items-end p-4
                  ${isDropdownOpen ? "opacity-100" : "group-hover:opacity-100 opacity-0"}`}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuEllipsis
                    imageUrl={post.image_url}
                    fileName="downloaded-image.jpg"
                    onOpenChange={(open) => setIsDropdownOpen(open)}
                    isOwner={isOwner}
                    onDelete={onDelete}
                    postId={post.id}
                  />
                </div>

                <div className="w-full flex items-center justify-between gap-2 z-0">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                    <strong className="text-white">{userName}</strong>
                  </Link>

                  <div className="flex items-center gap-4 text-white text-sm">
                    <LikeButton
                      liked={liked}
                      likeCount={likeCount}
                      onToggle={handleLikeToggle}
                    />

                    <BookmarkButton
                      bookmarked={bookmarked}
                      onToggle={() => setBookmarked(!bookmarked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </Masonry>
    </div>
  )
}

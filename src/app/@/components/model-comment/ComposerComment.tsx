"use client"

import { useEffect, useRef, useState } from "react"
import ColorThief from "colorthief"

import {
  Smile,
} from "lucide-react"

import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid"
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import EmojiPicker from "emoji-picker-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { useAuth } from "../../../hooks/useAuth"
import { motion } from "framer-motion"
import DropdownMenuEllipsis from "../dropdown-ellipsis"
import HoverCardUser from "../hover-card-user"
import { ZoomImage } from '../zoom-image'
import { Label } from "../ui/label"
import Link from 'next/link'

type Comment = {
  id: number;
  avatarUrl: string;
  name: string;
  username: string;
  content: string;
};

type ComposerCommentProps = {
  post: any;
  currentUserId?: number;
  onDelete?: (id: number) => void;
  allPosts?: any[];
};

// Pinterest style card for related post
function RelatedPostCard({ post, onClick }: { post: any; onClick?: () => void }) {
  return (
    <div className="relative group cursor-pointer rounded-2xl overflow-hidden shadow hover:shadow-lg transition" onClick={onClick}>
      <img
        src={post.image_url}
        alt={post.title}
        className="w-full object-cover rounded-2xl aspect-square"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="bg-black/60 rounded-full p-1 flex items-center justify-center">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>
  );
}

export function ComposerComment({ post, currentUserId, onDelete, allPosts = [] }: ComposerCommentProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const { session } = useAuth(true)

  const googleUser = session?.user
  const userName = googleUser?.name || 'Unknown User'
  const userEmail = googleUser?.email || ''
  const userAvatar = googleUser?.image || '/img/user.png'

  const addEmoji = (emojiData: any) => {
    setComment((prev) => prev + emojiData.emoji)
  }

  const isOwner = post.session?.user?.id === currentUserId

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (liked) {
      setLiked(false)
      setLikeCount((prev: number) => prev - 1)
    } else {
      setLiked(true)
      setLikeCount((prev: number) => prev + 1)
    }
  }

  const handleCommentSubmit = () => {
    if (!comment.trim()) return

    const newComment: Comment = {
      id: Date.now(),
      avatarUrl: userAvatar,
      name: userName,
      username: userEmail,
      content: comment.trim(),
    }

    setComments([newComment, ...comments])
    setComment('')
    setShowPicker(false)
  }

  // ColorThief phần
  const [palette, setPalette] = useState<number[][]>([])
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const img = imgRef.current

    if (img.complete) {
      extractColors()
    } else {
      img.onload = () => {
        extractColors()
      }
    }

    function extractColors() {
      try {
        const colorThief = new ColorThief()
        const colors = colorThief.getPalette(img, 7)
        setPalette(colors)
      } catch (error) {
        console.error("ColorThief error:", error)
      }
    }
  }, [currentPost.image_url])

  // Related posts logic
  let relatedPosts: any[] = [];
  if (allPosts.length > 0) {
    if (currentPost.topic) {
      relatedPosts = allPosts.filter(
        (p: any) => p.id !== currentPost.id && p.topic === currentPost.topic
      );
    }
    if (relatedPosts.length < 4) {
      const others = allPosts.filter((p: any) => p.id !== currentPost.id && (!currentPost.topic || p.topic !== currentPost.topic));
      while (relatedPosts.length < 4 && others.length > 0) {
        const idx = Math.floor(Math.random() * others.length);
        relatedPosts.push(others.splice(idx, 1)[0]);
      }
    }
    relatedPosts = relatedPosts.slice(0, 8);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div key={currentPost.id} className="mb-4 break-inside-avoid cursor-pointer">
          <div className="mx-auto">
            <div className="relative group cursor-pointer">
              <img
                ref={imgRef}
                src={currentPost.image_url}
                alt="Post"
                crossOrigin="anonymous"
                className="w-full rounded-lg object-cover"
              />
              <div
                className={`absolute inset-0 bg-black/30 rounded-lg transition-opacity duration-300 flex items-end p-4
                  ${isDropdownOpen ? "opacity-100" : "group-hover:opacity-100 opacity-0"}`}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuEllipsis
                    imageUrl={currentPost.image_url}
                    fileName="downloaded-image.jpg"
                    onOpenChange={(open) => setIsDropdownOpen(open)}
                    isOwner={isOwner}
                    onDelete={onDelete}
                    postId={currentPost.id}
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
                    <button
                      onClick={handleLikeToggle}
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
                    </button>
                    <span>{likeCount}</span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setBookmarked(!bookmarked)
                      }}
                      className={`transition-colors cursor-pointer ${
                        bookmarked ? "text-white" : "hover:text-black"
                      }`}
                    >
                      {bookmarked ? (
                        <BookmarkSolid className="w-6 h-6" />
                      ) : (
                        <BookmarkOutline className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-7xl flex flex-col overflow-x-hidden break-words">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Ảnh lớn và info */}
          <div className="md:w-1/2 w-full">
            <DialogHeader className="max-w-3xl">
              <DialogTitle className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{userName}</p>
                </div>
              </DialogTitle>
              <p className="text-xl font-semibold">{currentPost.title}</p>
              <p className="text-sm">{currentPost.content}</p>
              <div className="relative h-[600px] bg-gray-100 flex items-center justify-center">
                <img
                  src={currentPost.image_url}
                  alt="Post"
                  className="object-contain h-full"
                />
                <ZoomImage image={currentPost.image_url} />
              </div>
            </DialogHeader>
          </div>
          {/* Right: Feedback/comment */}
          <div className="md:w-1/2 w-full flex flex-col gap-2 px-2">
            <div className="flex items-center justify-between">
              {palette.length > 0 && (
                <div className="flex gap-1">
                  {palette.map((color, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-300 w-8 h-8"
                      style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                      title={`rgb(${color[0]}, ${color[1]}, ${color[2]})`}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLikeToggle}
                  className={`transition-colors cursor-pointer flex items-center gap-2 border p-2 rounded-xl hover:bg-gray-100 ${
                    liked ? "text-red-500 border-red-300" : "border-gray-300"
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

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`transition-colors cursor-pointer border p-2 rounded-xl hover:bg-gray-100 ${
                    bookmarked ? "text-black border-black" : "border-gray-300"
                  }`}
                >
                  {bookmarked ? (
                    <BookmarkSolid className="w-6 h-6" />
                  ) : (
                    <BookmarkOutline className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <Label>
              <p className="text-xl font-semibold">Feedback</p>
            </Label>

            <div className="relative w-full col-span-3">
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Icon emoji */}
              <Smile
                className="absolute left-3 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPicker(prev => !prev)}
              />

              {showPicker && (
                <div className="absolute top-10 left-0 z-50">
                  <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData)} />
                </div>
              )}

              {/* Nút Post nằm trong textarea */}
              <button
                onClick={handleCommentSubmit}
                className="absolute bottom-3 right-2 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
                title="Post Comment"
              >
                <PaperAirplaneIcon className="h-4 w-4"/>
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {comments.map(({ id, avatarUrl, name, username, content }) => (
                <div key={id} className="flex items-start gap-3">
                  <HoverCardUser avatarUrl={avatarUrl} name={name} username={username} />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
        {/* Related Posts Suggestion luôn ở dưới cùng dialog */}
        {relatedPosts.length > 0 && (
          <div className="mt-8 w-full -mx-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-8">
              {relatedPosts.map((rel) => (
                <RelatedPostCard key={rel.id} post={rel} onClick={() => setCurrentPost(rel)} />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

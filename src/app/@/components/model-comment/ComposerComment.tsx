"use client"

import {
  MessageCircle,
  Smile,
  Ellipsis,
  Maximize2
} from "lucide-react"

import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid"
import EmojiPicker from "emoji-picker-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react"
import { motion } from "framer-motion"
import { InputComment } from "../ui/input-comment"
import DropdownMenuEllipsis from "../dropdown-ellipsis"
import HoverCardUser from "../hover-card-user"
import { ZoomImage } from '../zoom-image'
import { AILogo } from "../ai-logo"
import { Label } from "../ui/label"
import Link from 'next/link'

interface Post {
  id: number
  name: string
  text: string
  image_url: string
}

export function ComposerComment({ post }: { post: Post }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const { session, status } = useAuth(true);

  // Extract Google user information
  const googleUser = session?.user;
  const userName = googleUser?.name || 'Unknown User';
  const userEmail = googleUser?.email || '';
  const userAvatar = googleUser?.image || '/img/user.png';
  
  // Extract username from email (before @gmail.com)
  const username = userEmail ? userEmail.split('@')[0] : 'unknown';

  const addEmoji = (emojiData: any) => {
    setComment((prev) => prev + emojiData.emoji)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div key={post.id} className="mb-4 break-inside-avoid cursor-pointer">
          <div className="mx-auto">
            <div className="relative group cursor-pointer">
              <img
                src={post.image_url}
                alt="Post"
                className="w-full rounded-lg object-cover"
              />
              <div
                className={`absolute inset-0 bg-black/30 rounded-lg transition-opacity duration-300 flex items-end p-4
                  ${isDropdownOpen ? "opacity-100" : "group-hover:opacity-100 opacity-0"}`}
              >
                {/* Dropdown */}
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuEllipsis
                    imageUrl={post.image_url}
                    fileName="downloaded-image.jpg"
                    onOpenChange={(open) => setIsDropdownOpen(open)}
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

                  {/* Heart + Bookmark */}
                  <div className="flex items-center gap-4 text-white text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLiked(!liked)
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
                    </button>
                    <span>123</span>

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

      <DialogContent className="sm:max-w-5xl grid grid-cols-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-gray-500">
                @{username}
              </p>
            </div>
          </DialogTitle>

          <p className="text-sm">{post.text}</p>

          <div className="relative">
            <img
              src={post.image_url}
              alt="Post"
              className="object-cover h-full w-full rounded-xl"
            />
            <AILogo imageUrl={post.image_url} />
            <ZoomImage image={post.image_url} />
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-2">
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <button
              onClick={() => setLiked(!liked)}
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
              <span>123</span>
            </button>

            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`transition-colors cursor-pointer ${
                bookmarked ? "text-black" : "hover:text-black"
              }`}
            >
              {bookmarked ? (
                <BookmarkSolid className="w-6 h-6" />
              ) : (
                <BookmarkOutline className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="relative w-full col-span-3">
            <InputComment
              id="comment"
              typeof="submit"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full pl-10"
            />
            <Smile
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPicker(prev => !prev)}
            />

            {showPicker && (
              <div className="absolute top-full left-0 z-50">
                <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData)} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Label>
              <p className="text-sm font-semibold">Comments</p>
              <p className="text-sm text-gray-500">3 comments</p>
            </Label>

            <div className="flex items-start gap-3">
              <HoverCardUser
                avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
                name="Alice"
                username="alice_wonderland"
              />
              <div>
                <p className="text-sm font-medium">Alice</p>
                <p className="text-sm text-gray-700">Amazing work, keep it up!</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

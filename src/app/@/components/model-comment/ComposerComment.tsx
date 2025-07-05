"use client"

import { Heart, MessageCircle, Bookmark, Smile } from "lucide-react"
import { Button } from "../ui/button"
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
import { InputComment } from "../ui/input-comment"
import HoverCardUser from "../hover-card-user"
import { Label } from "../ui/label"

interface Post {
  id: number
  name: string
  time: string
  text: string
  image: string
}

export function ComposerComment({ post }: { post: Post }) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div key={post.id} className="mb-4 break-inside-avoid">
          <div className="mx-auto">
            <img
              src={post.image}
              alt="Post"
              className="w-full rounded-lg object-cover cursor-pointer"
            />
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div className="flex items-center gap-2">
                <img
                  src="https://www.parents.com/thmb/lmejCapkkBYa0LQoezl2RxBi1Z0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-911983386-d50a1de241d44f829b17053ace814f4e.jpg"
                  alt={post.name}
                  className="w-10 h-10 rounded-full object-cover"
                /> 
                <strong>{post.name}</strong>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl grid grid-cols-2">
        <DialogHeader>
          <DialogDescription>
            <img
              src={post.image}
              alt="Post"
              className="object-contain h-full rounded-sm"
            />
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-2">
          <DialogTitle className="flex items-center gap-3">
            <img
              src="https://www.parents.com/thmb/lmejCapkkBYa0LQoezl2RxBi1Z0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-911983386-d50a1de241d44f829b17053ace814f4e.jpg"
              alt={post.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{post.name}</p>
              <p className="text-xs text-gray-500">@{post.name.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
          </DialogTitle>

          <p className="text-sm text-gray-800 border-b pb-4">{post.text}</p>

          {/* Comment List */}
          <div className="flex flex-col gap-4">
            <Label>
              <p className="text-sm font-semibold">Comments</p>
              <p className="text-sm text-gray-500">3 comments</p>
            </Label>
            {/* User Comment */}
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

        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <button className="hover:text-red-500 transition-colors cursor-pointer flex items-center gap-2">
            <Heart className="w-6 h-6" /> 
            <span>123</span>
          </button>

          <button className="hover:text-blue-500 transition-colors cursor-pointer">
            <MessageCircle className="w-6 h-6" />
          </button>

          <button className="hover:text-green-600 transition-colors cursor-pointer">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        <DialogFooter className="flex items-center gap-3">
          <InputComment
            id="comment"
            typeof="submit"
            placeholder="Write your comment..."
            className="col-span-3"
          />
          <Smile className="w-8 h-8 text-gray-400 cursor-pointer" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

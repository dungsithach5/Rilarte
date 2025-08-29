"use client"

import { CalendarIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar"
import { Button } from "./ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card"
import Link from "next/link"

interface User {
  avatarUrl: string
  name: string
  username: string
  userId?: number | string;
}

export default function HoverCardUser({ avatarUrl, name, username, userId }: User) {
  const profileLink = userId ? `/profile/${userId}/${username}` : '/profile';
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={profileLink}>
          <img
            src={avatarUrl}
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-[350px]">
        {/* Centered Avatar */}
        <div className="flex justify-center -mt-13">
          <Avatar className="w-24 h-24 border-2 border-white shadow-md">
            <Link href={profileLink}>
              <AvatarImage src={avatarUrl} />
            </Link>
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="text-center mt-4">
          <h4 className="text-lg font-semibold">{name}</h4>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-semibold">0</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">0</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">0</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link href={profileLink}>
            <button className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors">
              View Profile
            </button>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

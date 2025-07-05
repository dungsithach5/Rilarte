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
}

export default function HoverCardUser({ avatarUrl, name, username }: User) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href="/profile">
          <img
            src={avatarUrl}
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-[350px]">
        <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D" alt="" className="h-26 w-full object-cover bg-center rounded" />

        {/* Centered Avatar */}
        <div className="flex justify-center -mt-13">
          <Avatar className="w-24 h-24 border-2 border-white shadow-md">
            <Link href="/profile">
              <AvatarImage src={avatarUrl} />
            </Link>
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="text-center mt-2">
          <h2 className="font-semibold text-lg">{name}</h2>
          <p className="text-sm text-gray-500">@{username}</p>

          {/* Stats */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            <div className="flex-1">
              <p className="font-semibold">1</p>
              <p className="text-xs">Following</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold">3</p>
              <p className="text-xs">Followers</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold">16</p>
              <p className="text-xs">Post Views</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 mt-4">
            <Button variant="default" className="w-full text-sm cursor-pointer">
              Follow
            </Button>
            <Button variant="outline" className="w-full text-sm cursor-pointer">
              Message
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

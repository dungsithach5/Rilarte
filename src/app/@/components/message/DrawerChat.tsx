"use client"

import * as React from "react"
import { ArrowLeft, ArrowUp } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer"
import { ChatUserItem } from "./ChatUserItem"
import { ChatHeader } from "./ChatHeader"
import { ChatBubble } from "./ChatBubble"

import {
  ChatBubbleOvalLeftIcon as ChatOutline,
} from "@heroicons/react/24/outline"
import {
  ChatBubbleOvalLeftIcon as ChatSolid,
} from "@heroicons/react/24/solid"

const users = [
  {
    name: "Alice",
    message: "Hey, how are you?",
    time: "10:30",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    chat: [
      { message: "Hey, how are you?", isSender: false },
      { message: "I'm good, thanks!", isSender: true },
    ],
  },
]

export default function DrawerChat() {
  const [selected, setSelected] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button onClick={() => setSelected(null)} className="cursor-pointer">
          {open ? (
            <ChatSolid className="w-7 h-7 text-gray-800" />
          ) : (
            <ChatOutline className="w-7 h-7 text-gray-800" />
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="flex w-full h-screen overflow-hidden">
          {selected === null ? (
            <div className="w-full h-auto">
              <div className="p-3 text-black font-bold text-2xl">Chats</div>
              <div className="overflow-y-auto h-[450px]">
                {users.map((user, idx) => (
                  <div
                    key={user.name}
                    onClick={() => setSelected(idx)}
                  >
                    <ChatUserItem {...user} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-gray-500">
                <button className="mr-2" onClick={() => setSelected(null)}>
                  <ArrowLeft size={30} className="cursor-pointer" />
                </button>
                <ChatHeader
                  name={users[selected].name}
                  avatar={users[selected].avatar}
                />
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {users[selected].chat.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    message={msg.message}
                    isSender={msg.isSender}
                    avatar={!msg.isSender ? users[selected].avatar : undefined}
                  />
                ))}
              </div>
              <div className="p-4">
                <form action="" className="flex gap-2">
                  <input
                    className="w-full rounded-full border px-3 py-3"
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="rounded-full bg-black text-white w-12 h-12 flex items-center justify-center cursor-pointer">
                    <ArrowUp size={23} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

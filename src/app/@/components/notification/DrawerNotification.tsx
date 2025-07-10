"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer"

import {
  BellIcon as BellOutline,
} from "@heroicons/react/24/outline"
import {
  BellIcon as BellSolid,
} from "@heroicons/react/24/solid"

export default function DrawerChat() {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger type="button" asChild>
        <button className="relative cursor-pointer">
          {open ? (
            <BellSolid className="w-7 h-7 text-gray-800" />
          ) : (
            <BellOutline className="w-7 h-7 text-gray-800" />
          )}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="bg-white w-[360px] p-4 overflow-y-auto border-r border-gray-200">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">Who to follow</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ethan Carter', username: '@ethancarter', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-hoodie_1308-176157.jpg?semt=ais_hybrid&w=740' },
              { name: 'Isabella Moreno', username: '@isabellamoreno', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-hoodie_1308-176157.jpg?semt=ais_hybrid&w=740' },
              { name: 'Luca Schneider', username: '@lucaschneider', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-hoodie_1308-176157.jpg?semt=ais_hybrid&w=740' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={f.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.username}</div>
                </div>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition cursor-pointer">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Notification</h3>
          {[
            {
              user: 'Phong To',
              content: 'đã gửi cho bạn lời mời kết bạn.',
              time: '1 ngày',
              avatar: 'https://img.freepik.com/free-vector/smiling-young-man-hoodie_1308-176157.jpg?semt=ais_hybrid&w=740',
              unread: true,
            },
            {
              user: 'Durex Vietnam',
              content: 'đã đăng video mới: "CỞI MỞ MÙA 5| EP03|..."',
              time: '1 ngày',
              avatar: 'https://img.freepik.com/free-vector/smiling-young-man-hoodie_1308-176157.jpg?semt=ais_hybrid&w=740',
              unread: true,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <img
                src={item.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-sm text-gray-800">
                <span className="font-semibold">{item.user}</span> {item.content}
                <div className="text-xs text-gray-400">{item.time}</div>
              </div>
              {item.unread && (
                <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

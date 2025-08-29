"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

import {
  BellIcon as BellOutline,
} from "@heroicons/react/24/outline"
import {
  BellIcon as BellSolid,
} from "@heroicons/react/24/solid"
import { useAuth } from "../../../hooks/useAuth"
import { useSocket } from "../../../context/SocketContext"
import { fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../../services/Api/notifications"
import API from '../../../services/Api'

interface User {
  id: number
  username: string
  email?: string
  avatar_url?: string
  image?: string
}

// API function to fetch user names
const fetchUserNames = async (userIds: number[]) => {
  try {
    const response = await fetch(`http://localhost:5001/api/users/batch?ids=${userIds.join(',')}`)
    const users = await response.json()
    return users.reduce((acc: any, user: any) => {
      acc[user.id] = user.username
      return acc
    }, {})
  } catch (error) {
    return {}
  }
}

export default function DrawerNotification() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userNames, setUserNames] = useState<{[key: number]: string}>({})
  const [whoToFollow, setWhoToFollow] = useState<User[]>([])
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()

  // Fetch Who to follow users
  useEffect(() => {
    const fetchWhoToFollow = async () => {
      if (!user?.id) return
      try {
        const response = await API.get('/users/public')
        if (response.data.success && response.data.users) {
          // Bỏ user hiện tại và lấy tối đa 3 user
          const filtered = response.data.users
            .filter((u: User) => u.id !== user.id)
            .slice(0, 3)
          setWhoToFollow(filtered)
        }
      } catch (error) {}
    }

    fetchWhoToFollow()
  }, [user?.id])

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  useEffect(() => {
    if (socket && isConnected && user?.id) {
      socket.emit('join_notifications', user.id)
    }
  }, [socket, isConnected, user?.id])

  useEffect(() => {
    if (open && user?.id) {
      fetchNotifications()
    }
  }, [open, user?.id])

  useEffect(() => {
    if (notifications.length > 0) {
      const userIds = Array.from(new Set(notifications.map(n => n.related_user_id).filter(Boolean)))
      if (userIds.length > 0) {
        fetchUserNames(userIds).then(names => {
          setUserNames(prev => ({ ...prev, ...names }))
        })
      }
    }
  }, [notifications])

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return

    socket.emit('join_notifications', user.id)

    socket.on('new_notification', (notification: any) => {
      setNotifications(prev => [notification, ...prev])
    })

    return () => {
      socket.off('new_notification')
    }
  }, [socket, isConnected, user?.id])

  const fetchNotifications = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await fetchUserNotifications(user.id)
      setNotifications(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {}
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {}
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_like': return '❤️'
      case 'comment': return '💬'
      case 'comment_reply': return '↩️'
      case 'comment_like': return '👍'
      case 'follow': return '👥'
      default: return '🔔'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US')
  }

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger type="button" asChild>
        <button className="relative cursor-pointer">
          {open ? (
            <BellSolid className="w-7 h-7 text-gray-800" />
          ) : (
            <BellOutline className="w-7 h-7 text-gray-800" />
          )}
          {(() => {
            const unreadCount = notifications.filter(n => !n.is_read).length
            if (unreadCount > 0) {
              return (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )
            }
            return null
          })()}
        </button>
      </DrawerTrigger>

      <DrawerContent className="bg-white w-[360px] p-4 overflow-y-auto border-r border-gray-200">
        <div className="space-y-6">
          {/* Who to Follow Section */}
          {whoToFollow.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Who to follow</h3>
                <Link href="/users" className="text-sm text-black">View more</Link>
              </div>
              <div className="space-y-3">
                {whoToFollow.map(u => {
                  const avatarUrl = u.avatar_url || u.image || '/img/user.png'
                  return (
                    <Link key={u.id} href={`/profile/${u.id}/${u.username}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Avatar className="w-10 h-10">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={u.username} />
                        ) : (
                          <AvatarFallback>{u.username[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{u.username}</div>
                        {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No notifications yet</div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'}`} onClick={() => handleNotificationClick(notification)}>
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold">
                          {userNames[notification.related_user_id] || `User #${notification.related_user_id}` || 'Unknown User'}
                        </span>{' '}
                        {notification.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</div>
                    </div>
                    {!notification.is_read && <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

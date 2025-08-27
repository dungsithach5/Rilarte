"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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
import { useAuth } from "../../../hooks/useAuth"
import { useSocket } from "../../../context/SocketContext"
import { fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../../services/Api/notifications"

// API function để fetch user names
const fetchUserNames = async (userIds: number[]) => {
  try {
    const response = await fetch(`http://localhost:5001/api/users/batch?ids=${userIds.join(',')}`)
    const users = await response.json()
    return users.reduce((acc: any, user: any) => {
      acc[user.id] = user.username
      return acc
    }, {})
  } catch (error) {
    console.error('Error fetching user names:', error)
    return {}
  }
}

export default function DrawerNotification() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userNames, setUserNames] = useState<{[key: number]: string}>({})
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()

  // Function để xử lý click notification
  const handleNotificationClick = (notification: any) => {
    console.log('🔔 Notification clicked:', notification)
    
    // Chỉ mark as read, không điều hướng
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    // Có thể thêm toast notification hoặc action khác ở đây
    console.log('✅ Notification marked as read, staying in drawer')
  }

  // Join notifications room immediately when user connects (separate effect)
  useEffect(() => {
    console.log('🚀 Join room effect triggered:', { socket: !!socket, isConnected, userId: user?.id })
    
    if (socket && isConnected && user?.id) {
      console.log('🚀 User connected, joining notifications room immediately')
      socket.emit('join_notifications', user.id)
      
      // Test emit to see if socket is working
      setTimeout(() => {
        console.log('🧪 Testing socket emit after 1 second...')
        socket.emit('test_connection', { message: 'Delayed test' })
      }, 1000)
      
      // Test join room again after 2 seconds
      setTimeout(() => {
        console.log('🔄 Testing join room again after 2 seconds...')
        socket.emit('join_notifications', user.id)
      }, 2000)
    } else {
      console.log('❌ Cannot join room:', { socket: !!socket, isConnected, userId: user?.id })
    }
  }, [socket, isConnected, user?.id])

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (open && user?.id) {
      fetchNotifications()
    }
  }, [open, user?.id])

  // Fetch user names when notifications change
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

  // WebSocket listeners for real-time notifications - ALWAYS ACTIVE
  useEffect(() => {
    console.log('🔌 WebSocket Notification Effect:', { socket: !!socket, isConnected, userId: user?.id })
    
    if (!socket || !isConnected || !user?.id) {
      console.log('❌ WebSocket not ready:', { socket: !!socket, isConnected, userId: user?.id })
      return
    }

    // Test WebSocket connection
    console.log('✅ WebSocket ready, testing connection...')
    socket.emit('test_connection', { message: 'Testing WebSocket connection' })

    // Join notifications room IMMEDIATELY when user connects
    console.log('📡 Joining notifications room for user:', user.id)
    socket.emit('join_notifications', user.id)

    // Listen for new notifications
    socket.on('new_notification', (notification: any) => {
      console.log('🔔 New notification received:', notification)
      console.log('🔔 Current notifications state:', notifications)
      
      // Always update notifications state, even when drawer is closed
      setNotifications(prev => {
        const newNotifications = [notification, ...prev]
        console.log('🔔 Updated notifications state:', newNotifications)
        return newNotifications
      })
      
      // Show toast notification if drawer is closed
      if (!open) {
        console.log('🔔 Showing toast notification (drawer closed)')
        // You can add a toast notification here
      }
    })

    // Listen for test response
    socket.on('test_response', (data: any) => {
      console.log('✅ WebSocket test response:', data)
    })

    // Listen for room join test
    socket.on('test_room_join', (data: any) => {
      console.log('✅ Room join test received:', data)
    })

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket listeners')
      socket.off('new_notification')
      socket.off('test_response')
      socket.off('test_room_join')
    }
  }, [socket, isConnected, user?.id]) // Remove 'open' dependency to keep listeners always active

  const fetchNotifications = async () => {
    if (!user?.id) return
    
    console.log('📥 Fetching notifications for user:', user.id)
    setLoading(true)
    try {
      const data = await fetchUserNotifications(user.id)
      console.log('📥 Notifications fetched:', data)
      setNotifications(data)
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id)
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'comment_reply':
        return '↩️'
      case 'comment_like':
        return '👍'
      case 'follow':
        return '👥'
      default:
        return '🔔'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
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
            console.log('🔔 Unread notifications count:', unreadCount, 'Total:', notifications.length)
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
                      {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications yet
              </div>
            ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {userNames[notification.related_user_id] || `User #${notification.related_user_id}` || 'Unknown User'}
                      </span>{' '}
                      {notification.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

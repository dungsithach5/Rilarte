"use client"

import { useState, useEffect, useRef } from "react"
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

import { useAuth } from "../../../hooks/useAuth"
import { useSelector } from "react-redux"
import DropdownMenuEllipsis from "../dropdown-ellipsis"
import HoverCardUser from "../hover-card-user"
import UserInfo from "./UserInfo"
import LikeButton from "./like-button"
import CommentLikeButton from "./comment-like-button"
import BookmarkButton from "./bookmark-button"
import ColorPalette from "./color-palette"
import EmojiPickerPopover from "./emoji-picker-popover"
import RelatedPosts from "./related-post"
import { Label } from "../ui/label"
import { likePost, unlikePost, checkUserLikePost, getPostLikes } from "../../../services/Api/postLikes"
import { getComments, createComment } from "../../../services/Api/comments"
import { savePost, unsavePost, checkSavedPost } from "../../../services/Api/savedPosts"

type Comment = {
  id: number
  avatarUrl: string
  name: string
  username: string
  content: string
}

type ComposerCommentProps = {
  post: any
  currentUserId?: number
  onDelete?: (id: number) => void
  relatedPosts?: any[]
}

export function ComposerComment({ post, currentUserId, onDelete, relatedPosts = [] }: ComposerCommentProps) {
  // --- State page post, không thay đổi ---
  const [currentPost] = useState(post)

  // --- State modal riêng ---
  const [modalPost, setModalPost] = useState(post)
  const [open, setOpen] = useState(false)
  const isClosingRef = useRef(false)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)

  const { session } = useAuth(false)
  const reduxUser = useSelector((state: any) => state.user.user)
  const googleUser = session?.user

  const currentUserName = reduxUser?.username || reduxUser?.name || googleUser?.name || 'Unknown User'
  const currentUserAvatar = reduxUser?.avatar || googleUser?.image || '/img/user.png'

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isOwner = post.session?.user?.id === currentUserId

  // --- Emoji ---
  const addEmoji = (emojiData: any) => setComment((prev) => prev + emojiData.emoji)

  // --- Load saved status cho modalPost ---
  useEffect(() => {
    const loadSavedStatus = async () => {
      let userId = currentUserId || reduxUser?.id || session?.user?.id
      if (userId && modalPost.id) {
        try {
          const { isSaved } = await checkSavedPost(Number(userId), modalPost.id)
          setBookmarked(isSaved)
        } catch (err) {
          console.error('Check saved error', err)
        }
      }
    }
    loadSavedStatus()
  }, [modalPost, currentUserId, reduxUser?.id, session?.user?.id])

  // --- Toggle bookmark ---
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    let userId = currentUserId || reduxUser?.id || session?.user?.id
    if (!userId) return
    try {
      if (bookmarked) {
        await unsavePost(Number(userId), modalPost.id)
        setBookmarked(false)
      } else {
        await savePost(Number(userId), modalPost.id)
        setBookmarked(true)
      }
    } catch (err) {
      console.error(err)
      alert('Error saving/unsaving post')
    }
  }

  // --- Toggle like ---
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user && !reduxUser) {
      alert('Please login to like posts')
      return
    }
    try {
      if (liked) {
        const likeData = await checkUserLikePost(modalPost.id)
        if (likeData.likeId) {
          await unlikePost(likeData.likeId)
          setLiked(false)
          setLikeCount((prev: number) => Math.max(0, prev - 1))
        }
      } else {
        await likePost(modalPost.id)
        setLiked(true)
        setLikeCount((prev: number) => prev + 1)
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 409) {
        setLiked(true)
        setLikeCount((prev: number) => prev + 1)
      } else {
        alert('Failed to update like')
      }
    }
  }

  // --- Submit comment ---
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return
    try {
      const newCommentData = await createComment(modalPost.id, comment.trim())
      setComment('')
      let userInfo = { id: newCommentData.user_id, username: 'Current User', avatar: '/img/user.png', name: 'Current User' }
      try {
        const userRes = await fetch(`http://localhost:5001/api/users/public/${newCommentData.user_id}`)
        if (userRes.ok) userInfo = (await userRes.json()).user
      } catch {}
      setComments([ { ...newCommentData, userInfo }, ...comments ])
    } catch (err) {
      console.error(err)
      alert('Failed to post comment')
    }
  }

  // --- Fetch likes & comments khi modalPost thay đổi ---
  useEffect(() => {
    if (!modalPost.id) return
    const fetchData = async () => {
      try {
        const likeList = await getPostLikes(modalPost.id)
        setLikeCount(Array.isArray(likeList) ? likeList.length : 0)

        const userLike = await checkUserLikePost(modalPost.id)
        setLiked(userLike.liked || false)

        const commentList = await getComments(modalPost.id)
        const commentsWithUser = await Promise.all(commentList.map(async (c: any) => {
          try {
            const userRes = await fetch(`http://localhost:5001/api/users/public/${c.user_id}`)
            if (userRes.ok) {
              const userData = await userRes.json()
              return { ...c, userInfo: userData.user }
            }
          } catch {}
          return c
        }))
        setComments(commentsWithUser)
      } catch (err) {
        console.error(err)
        setComments([])
        setLikeCount(0)
      }
    }
    fetchData()
  }, [modalPost, session, reduxUser])

  // --- Scroll top khi modalPost thay đổi ---
  useEffect(() => {
    dialogContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [modalPost])

  // --- Handle click related post ---
  const handleSelectRelatedPost = (newPost: any) => {
    isClosingRef.current = true
    setOpen(false)
    setTimeout(() => {
      setModalPost(newPost)
      setLiked(false)
      setBookmarked(false)
      setComments([])
      setLikeCount(newPost.likeCount || 0)
      setOpen(true)
      isClosingRef.current = false
    }, 150)
  }

  // --- Auto open modal theo URL ---
  useEffect(() => {
    const urlSlug = searchParams?.get('post')
    if (!open && urlSlug && String(urlSlug) === String(currentPost?.slug) && !isClosingRef.current) {
      setModalPost(currentPost)
      setOpen(true)
    } else if (!urlSlug) isClosingRef.current = false
  }, [searchParams, currentPost, open])

  return (
    <Dialog
      key={modalPost.id} 
      open={open}
      onOpenChange={(nextOpen) => {
        const params = new URLSearchParams(searchParams?.toString() || '')
        if (nextOpen) {
          isClosingRef.current = false
          if (modalPost?.slug) params.set('post', String(modalPost.slug))
        } else {
          isClosingRef.current = true
          if (params.get('post') === String(modalPost?.slug)) params.delete('post')
        }
        const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname
        router.replace(nextUrl, { scroll: false })
        setOpen(nextOpen)
      }}
    >
    <DialogTrigger asChild>
      <div
        className="mb-4 break-inside-avoid cursor-pointer"
      >
        <div className="relative group cursor-pointer">
          <img
            src={currentPost.image_url}
            alt={currentPost.title || "Post"}
            className="w-full rounded-sm object-cover"
            onContextMenu={(e) => currentPost.download_protected && e.preventDefault()}
            onDragStart={(e) => currentPost.download_protected && e.preventDefault()}
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
                downloadProtected={currentPost.download_protected}
              />
            </div>

            <div className="w-full flex items-center justify-between gap-2 z-0">
              <UserInfo
                userId={currentPost.user_id}
                username={currentUserName}
                avatar={currentUserAvatar}
                size="lg"
                textColor="white"
                className="flex items-center gap-2"
              />

              <div className="flex items-center gap-4 text-white text-sm">
                <LikeButton
                  liked={liked}
                  likeCount={likeCount}
                  onToggle={handleLikeToggle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogTrigger>

      <DialogContent ref={dialogContentRef} className="sm:max-w-7xl flex flex-col overflow-x-hidden break-words">
        {loading ? (
          <div className="flex justify-center items-center h-[650px]">
            <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 w-full">
              <DialogHeader className="max-w-3xl">
                <DialogTitle className="flex items-center gap-3">
                  <UserInfo
                    userId={modalPost.user_id}
                    username={currentUserName}
                    avatar={currentUserAvatar}
                    size="md"
                    textColor="black"
                  />
                </DialogTitle>
                <p className="text-xl font-semibold">{modalPost.title}</p>
                <p className="text-sm">{modalPost.content}</p>
                <div className="relative h-[650px] bg-gray-100 flex items-center justify-center">
                  <img src={modalPost.image_url} alt="Post" className="object-contain h-full" />
                </div>
              </DialogHeader>
            </div>

            <div className="md:w-1/2 w-full flex flex-col gap-2 px-2">
              <div className="flex items-center justify-between">
                <ColorPalette imageUrl={modalPost.image_url} />
                <div className="flex items-center gap-2">
                  <LikeButton liked={liked} likeCount={likeCount} onToggle={handleLikeToggle} />
                  <BookmarkButton bookmarked={bookmarked} onToggle={handleBookmarkToggle} />
                </div>
              </div>

              <Label><p className="text-xl font-semibold">Feedback</p></Label>

              <div className="relative w-full">
                <EmojiPickerPopover onSelect={addEmoji} />
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={handleCommentSubmit} className="absolute bottom-3 right-3 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition">
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {Array.isArray(modalPost.tags) && modalPost.tags.length > 0 && (
                  <div className="mb-4">
                    <Label className="block mb-2 text-sm font-semibold text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {modalPost.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <HoverCardUser avatarUrl={c.userInfo?.avatar || '/img/user.png'} name={c.userInfo?.name || `User ${c.user_id}`} username={c.userInfo?.username || `user${c.user_id}`} userId={c.user_id} />
                    <div className="w-full flex justify-between gap-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{c.userInfo?.name || `User ${c.user_id}`}</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <CommentLikeButton commentId={c.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <RelatedPosts
            relatedPosts={relatedPosts}
            currentUserId={currentUserId}
            onDelete={onDelete}
            userAvatar={currentUserAvatar}
            userName={currentUserName}
            onSelectPost={handleSelectRelatedPost}
            currentPostId={modalPost.id}
            // liked={liked}
            likeCount={likeCount}
            // handleLikeToggle={handleLikeToggle}
            // bookmarked={bookmarked}
            // setBookmarked={setBookmarked}
            isOwner={isOwner}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

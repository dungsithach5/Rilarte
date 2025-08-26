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
import { ZoomImage } from '../zoom-image'
import { Label } from "../ui/label"
import Link from 'next/link'
import { likePost, unlikePost, getPostLikes, checkUserLikePost } from "../../../services/Api/postLikes"
import { getComments, createComment } from "../../../services/Api/comments"
import { savePost, unsavePost, checkSavedPost } from "../../../services/Api/savedPosts"

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
  relatedPosts?: any[];
};

export function ComposerComment({ post, currentUserId, onDelete, relatedPosts = [] }: ComposerCommentProps) {
  const [currentPost, setCurrentPost] = useState(post)
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const isClosingRef = useRef(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const { session } = useAuth(false)
  const reduxUser = useSelector((state: any) => state.user.user)

  const googleUser = session?.user
  // Ưu tiên Redux user (login thường), fallback về NextAuth session (Google)
  const userName = reduxUser?.username || reduxUser?.name || googleUser?.name || 'Unknown User'
  const userEmail = reduxUser?.email || googleUser?.email || ''
  const userAvatar = reduxUser?.avatar || googleUser?.image || '/img/user.png'

  const addEmoji = (emojiData: any) => {
    setComment((prev) => prev + emojiData.emoji)
  }

  const isOwner = post.session?.user?.id === currentUserId

  // Load saved status when component mounts
  useEffect(() => {
    const loadSavedStatus = async () => {
      // Thử lấy user ID từ nhiều nguồn
      let userId = currentUserId;
      if (!userId) {
        userId = reduxUser?.id || session?.user?.id;
      }
      
      if (userId && post.id) {
        try {
          const { isSaved } = await checkSavedPost(Number(userId), post.id);
          setBookmarked(isSaved);
          console.log('Loaded saved status for post', post.id, ':', isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    
    loadSavedStatus();
  }, [currentUserId, post.id, reduxUser?.id, session?.user?.id]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Thử lấy user ID từ nhiều nguồn
    let userId = currentUserId;
    if (!userId) {
      userId = reduxUser?.id || session?.user?.id;
    }
    
    try {
      const userIdNumber = Number(userId);
      console.log('Using user ID:', userIdNumber, 'for post ID:', post.id);
      
      if (bookmarked) {
        await unsavePost(userIdNumber, post.id);
        setBookmarked(false);
        console.log('Post unsaved successfully');
      } else {
        await savePost(userIdNumber, post.id);
        setBookmarked(true);
        console.log('Post saved successfully');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Error saving/unsaving post');
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if user is authenticated
    if (!session?.user && !reduxUser) {
      alert('Please login to like posts');
      return;
    }

    try {
      if (liked) {
        // Unlike post - we need to get the like ID first
        const likeData = await checkUserLikePost(currentPost.id);
        if (likeData.likeId) {
          await unlikePost(likeData.likeId);
          setLiked(false);
          setLikeCount((prev: number) => Math.max(0, prev - 1));
        }
      } else {
        // Like post
        await likePost(currentPost.id);
        setLiked(true);
        setLikeCount((prev: number) => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      // Handle 409 conflict (user already liked)
      if (error.response?.status === 409) {
        setLiked(true);
        setLikeCount((prev: number) => prev + 1);
        return;
      }
      
      alert('Failed to update like. Please try again.');
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return

    try {
      const newCommentData = await createComment(currentPost.id, comment.trim());
      setComment('');
      
      // Get current user info using the user_id from the created comment
      let currentUserInfo = null;
      try {
        const userResponse = await fetch(`http://localhost:5001/api/users/public/${newCommentData.user_id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          currentUserInfo = userData.user;
        }
      } catch (error) {
        console.log('Error getting current user info:', error);
      }

      // Add new comment to the list immediately with user info
      const newComment = {
        ...newCommentData,
        userInfo: currentUserInfo || {
          id: newCommentData.user_id,
          username: 'Current User',
          avatar: '/img/user.png',
          name: 'Current User'
        }
      };
      
      setComments([newComment, ...comments]);
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  }

  useEffect(() => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentPost])

  useEffect(() => {
    setCurrentPost(post)
    setBookmarked(false)
    
    // Check if user has already liked this post and ensure token is available
    const checkUserLike = async () => {
      if (session?.user || reduxUser) {
        try {
          // For NextAuth users, ensure we have a JWT token
          if (session?.user && !localStorage.getItem('token')) {
            const tokenResponse = await fetch('/api/auth/save-token', {
              method: 'POST'
            });
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              localStorage.setItem('token', tokenData.token);
            }
          }
          
          const response = await checkUserLikePost(post.id);
          if (response.liked) {
            setLiked(true);
          }
        } catch (error) {
          console.log('Error checking user like status:', error);
        }
      }
    };
    
    // Get actual like count from database
    const getLikeCount = async () => {
      try {
        const response = await getPostLikes(post.id);
        if (Array.isArray(response)) {
          setLikeCount(response.length);
        } else {
          setLikeCount(0);
        }
      } catch (error) {
        console.log('Error getting like count:', error);
        setLikeCount(0);
      }
    };

    // Get actual comments from database
    const getCommentsData = async () => {
      try {
        const response = await getComments(post.id);
        if (Array.isArray(response)) {
          // Fetch user information for each comment
          const commentsWithUserInfo = await Promise.all(
            response.map(async (comment: any) => {
              try {
                const userResponse = await fetch(`http://localhost:5001/api/users/public/${comment.user_id}`);
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  return {
                    ...comment,
                    userInfo: userData.user
                  };
                }
              } catch (error) {
                console.log('Error fetching user info:', error);
              }
              return comment;
            })
          );
          setComments(commentsWithUserInfo);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.log('Error getting comments:', error);
        setComments([]);
      }
    };
    
    checkUserLike();
    getLikeCount();
    getCommentsData();
  }, [post, session, reduxUser])

  // Auto-open modal if URL contains this post's slug
  useEffect(() => {
    const urlSlug = searchParams?.get('post');
    if (!open && urlSlug && String(urlSlug) === String(post?.slug) && !isClosingRef.current) {
      setOpen(true);
    } else if (!urlSlug) {
      isClosingRef.current = false;
    }
  }, [searchParams, post?.slug, open]);

  const handleSelectRelatedPost = (newPost: any) => {
  setOpen(false); 
  isClosingRef.current = true;

  setTimeout(() => {
    setCurrentPost(newPost);
    setLikeCount(newPost.likeCount || 0);
    setLiked(false);
    setBookmarked(false);
    setComments([]);
    setLoading(false);

    try {
      const params = new URLSearchParams(searchParams?.toString());
      if (newPost?.slug) {
        params.set('post', String(newPost.slug));
        const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
      }
    } catch (err) {
      console.log("Error :", err);
    }
      isClosingRef.current = false; 
    }, 150);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        try {
          const params = new URLSearchParams(searchParams?.toString() || '')
          if (nextOpen) {
            isClosingRef.current = false
            if (currentPost?.slug) {
              params.set("post", String(currentPost.slug))
              const nextUrl = `${pathname}?${params.toString()}`
              router.replace(nextUrl, { scroll: false })
            }
          } else {
            isClosingRef.current = true
            if (params.get("post") === String(currentPost?.slug)) {
              params.delete("post")
            }
            const nextUrl =
              params.size > 0 ? `${pathname}?${params.toString()}` : pathname
            router.replace(nextUrl, { scroll: false })
          }

          setOpen(nextOpen)
        } catch (err) {
          console.log("Error", err)
        }
      }}
    >
      <DialogTrigger asChild>
        <div key={currentPost.id} className="mb-4 break-inside-avoid cursor-pointer">
          <div className="mx-auto">
          <div className="relative group cursor-pointer">
              <img
                src={currentPost.image_url}
                alt="Post"
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
                    username={userName}
                    avatar={userAvatar}
                    size="lg"
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
        </div>
      </DialogTrigger>

      <DialogContent 
        ref={dialogContentRef}
        className="sm:max-w-7xl flex flex-col overflow-x-hidden break-words"
      >
        {loading ? (
          <div className="flex justify-center items-center h-[650px]">
            <svg
              className="animate-spin h-10 w-10 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 w-full">
              <DialogHeader className="max-w-3xl">
                <DialogTitle className="flex items-center gap-3">
                  <UserInfo
                    userId={currentPost.user_id}
                    username={userName}
                    avatar={userAvatar}
                    size="md"
                    showName={true}
                    onClick={(e) => e.stopPropagation()}
                  />
                </DialogTitle>
                <div className="flex flex-col text-left">
                  <p className="text-xl font-semibold">{currentPost.title}</p>
                  <p className="text-sm">{currentPost.content}</p>
                </div>
                <div className="relative h-[650px] bg-gray-100 flex items-center justify-center">
                  <img
                    src={currentPost.image_url}
                    alt="Post"
                    className="object-contain h-full"
                    onContextMenu={(e) => currentPost.download_protected && e.preventDefault()}
                    onDragStart={(e) => currentPost.download_protected && e.preventDefault()}
                  />
                </div>
              </DialogHeader>
            </div>

            <div className="md:w-1/2 w-full flex flex-col gap-2 px-2">
              <div className="flex items-center justify-between">
                <ColorPalette imageUrl={currentPost.image_url} />

                <div className="flex items-center gap-2">
                  <LikeButton
                    liked={liked}
                    likeCount={likeCount}
                    onToggle={handleLikeToggle}
                  />

                  <BookmarkButton
                    bookmarked={bookmarked}
                    onToggle={handleBookmarkToggle}
                  />
                </div>
              </div>

              <Label>
                <p className="text-xl font-semibold">Feedback</p>
              </Label>

              <div className="relative w-full">
                <EmojiPickerPopover onSelect={addEmoji} />

                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  onClick={handleCommentSubmit}
                  className="absolute bottom-3 right-3 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
                  title="Post Comment"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <HoverCardUser 
                      avatarUrl={comment.userInfo?.avatar || '/img/user.png'} 
                      name={comment.userInfo?.name || `User ${comment.user_id}`} 
                      username={comment.userInfo?.username || `user${comment.user_id}`} 
                      userId={comment.user_id}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{comment.userInfo?.name || `User ${comment.user_id}`}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <CommentLikeButton commentId={comment.id} />
                        <span className="text-xs text-gray-500">Reply</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {Array.isArray(currentPost.tags) && currentPost.tags.length > 0 && (
                <div className="mt-6">
                  <Label className="block mb-2 text-sm font-semibold text-gray-700">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <RelatedPosts
            relatedPosts={relatedPosts}
            currentUserId={currentUserId}
            onDelete={onDelete}
            userAvatar={userAvatar}
            userName={userName}
            liked={liked}
            likeCount={likeCount}
            handleLikeToggle={handleLikeToggle}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
            isOwner={isOwner}
            onSelectPost={handleSelectRelatedPost}
            currentPostId={currentPost.id}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

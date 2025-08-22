"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { loginSuccess } from "../context/userSlice"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useDispatch()
  
  // Lấy user từ Redux (login thường)
  const userRedux = useSelector((state: any) => state.user)

  // Ưu tiên user từ Redux nếu có token (login thường)
  const user = useMemo(() => {
    return userRedux && userRedux.token ? userRedux.user : session?.user
  }, [userRedux?.token, userRedux?.user, session?.user])

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!(user || (userRedux && userRedux.token))
  }, [user, userRedux?.token])

  // Save NextAuth session to Redux and localStorage when available
  useEffect(() => {
    if (session?.user) {
      console.log('🔐 Saving NextAuth session to Redux and localStorage');
      
      // Use NextAuth's JWT token instead of mock token
      const nextAuthToken = `nextauth_jwt_${session.user.id}`;
      
      // Always save to Redux store (overwrite existing token)
      dispatch(loginSuccess({
        avatar: session.user.image || '/img/user.png',
        token: nextAuthToken,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          username: session.user.name
        }
      }));
      
      // Always save to localStorage for API requests
      localStorage.setItem('token', nextAuthToken);
      localStorage.setItem('user', JSON.stringify(session.user));
      
      console.log('✅ NextAuth session saved to Redux and localStorage');
    }
  }, [session, dispatch]);

  useEffect(() => {
    // Debug log
    console.log('=== USE AUTH DEBUG ===');
    console.log('Session:', session);
    console.log('Status:', status);
    console.log('UserRedux:', userRedux);
    console.log('UserRedux.user:', userRedux?.user);
    console.log('UserRedux.user.id:', userRedux?.user?.id);
    console.log('Session.user.id:', session?.user?.id);
    console.log('User:', user);
    console.log('RequireAuth:', requireAuth);
    console.log('IsAuthenticated:', isAuthenticated);
    
    if (requireAuth && !isAuthenticated) {
      console.log('Redirecting to auth - no user found');
      router.push("/auth")
    }
  }, [requireAuth, isAuthenticated, router, status])

  return { user, session, status, isAuthenticated }
}
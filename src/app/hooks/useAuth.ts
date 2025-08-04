"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useSelector } from "react-redux"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
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

  useEffect(() => {
    // Debug log
    console.log('=== USE AUTH DEBUG ===');
    console.log('Session:', session);
    console.log('Status:', status);
    console.log('UserRedux:', userRedux);
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
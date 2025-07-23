"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  // Lấy user từ Redux (login thường)
  const userRedux = useSelector((state: any) => state.user)

  // Ưu tiên user từ Redux nếu có token (login thường)
  const user = userRedux && userRedux.token ? userRedux : session?.user

  useEffect(() => {
    if (requireAuth && !user) {
      router.push("/auth")
    }
  }, [requireAuth, user, router])

  return { user, session, status }
}
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
      
      // Get database ID from backend using email
      const fetchDatabaseUser = async () => {
        try {
          const response = await fetch(`http://localhost:5001/api/users/email/${session.user.email}`);
          if (response.ok) {
            const userData = await response.json();
            const databaseId = userData.user.id;
            
            console.log('🔍 Database user found:', { email: session.user.email, databaseId });
            
            // Use database ID for token and user object
            const nextAuthToken = `nextauth_jwt_${databaseId}`;
            
            // Always save to Redux store (overwrite existing token)
            dispatch(loginSuccess({
              avatar: session.user.image || '/img/user.png',
              token: nextAuthToken,
              user: {
                id: databaseId, // Use database ID instead of OAuth ID
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                username: session.user.name,
                onboarded: userData.user.onboarded // Lấy onboarded từ database
              }
            }));
            
            // Always save to localStorage for API requests
            localStorage.setItem('token', nextAuthToken);
            localStorage.setItem('user', JSON.stringify({
              ...session.user,
              id: databaseId, // Use database ID instead of OAuth ID
              onboarded: userData.user.onboarded // Lấy onboarded từ database
            }));
            
            console.log('✅ NextAuth session saved to Redux and localStorage with database ID');
          } else {
            console.error('❌ Failed to fetch database user:', response.status);
            // Fallback to OAuth ID if backend fails
            const nextAuthToken = `nextauth_jwt_${session.user.id}`;
            dispatch(loginSuccess({
              avatar: session.user.image || '/img/user.png',
              token: nextAuthToken,
              user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                username: session.user.name,
                onboarded: false // Default to false nếu không fetch được từ DB
              }
            }));
          }
        } catch (error) {
          console.error('❌ Error fetching database user:', error);
          // Fallback to OAuth ID if backend fails
          const nextAuthToken = `nextauth_jwt_${session.user.id}`;
          dispatch(loginSuccess({
            avatar: session.user.image || '/img/user.png',
            token: nextAuthToken,
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              username: session.user.name,
              onboarded: false // Default to false nếu không fetch được từ DB
            }
          }));
        }
      };
      
      fetchDatabaseUser();
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
"use client"

import { useState } from "react"
import Cookies from "js-cookie"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../../../context/userSlice"
import { cn } from "../../../../lib/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { ForgotPasswordForm } from "./forgot-password-form"
import { ArrowLeft } from 'lucide-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const { data: session } = useSession()
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return (
      <div>
        <ForgotPasswordForm />
        <button
          className="mt-4 text-sm hover:underline-offset-1 hover:underline cursor-pointer flex items-center justify-center gap-2"
          onClick={() => setShowForgot(false)}
          type="button"
        >
          <ArrowLeft size={15} />
          Back to login
        </button>
      </div>
    );
  }

  if (session) {
    router.push("/")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      Cookies.set('token', data.token, { expires: 1, secure: false, sameSite: 'lax' })
      localStorage.setItem('user', JSON.stringify(data.user))

      const avatarUrl = data.user?.avatar && data.user.avatar !== ''
        ? data.user.avatar
        : '/img/user.png';

      dispatch(loginSuccess({
        avatar: avatarUrl,
        token: data.token,
      }));
      console.log('Dispatching loginSuccess with:', {
        avatar: avatarUrl,
        token: data.token,
      });

      window.location.href = "/";
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    try {
      console.log('2. Calling signIn...')
      const result = await signIn('google', { 
        callbackUrl: '/' 
      })
      
      if (result?.error) {
        console.log('4. Error:', result.error)
        setError('Google login failed: ' + result.error)
      } else {
        console.log('4. Success - redirecting...')
      }
    } catch (err) {
      setError('Google login failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer"
              onClick={() => setShowForgot(true)}
            >
              Forgot your password?
            </button>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer" 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            className=""
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.3 0 6.3 1.2 8.6 3.1l6.4-6.4C34.2 2.3 29.4 0 24 0 14.8 0 6.9 5.7 2.8 13.9l7.5 5.8C12.4 13.1 17.7 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.7h12.5c-.3 2.1-1.5 5.3-4.5 7.4l7 5.4c4.1-3.8 6.5-9.4 6.5-16z"
            />
            <path
              fill="#FBBC05"
              d="M10.3 28.2c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.5-5.8C1 16.8 0 20.3 0 23.5s1 6.7 2.8 9.7l7.5-5z"
            />
            <path
              fill="#34A853"
              d="M24 47c6.4 0 11.8-2.1 15.7-5.7l-7-5.4c-2 1.4-4.8 2.3-8.7 2.3-6.3 0-11.6-3.6-13.8-8.7l-7.5 5.8C6.9 42.3 14.8 47 24 47z"
            />
          </svg>
          {loading ? 'Signing in...' : 'Login with Google'}
        </Button>
      </div>
    </form>
  )
}

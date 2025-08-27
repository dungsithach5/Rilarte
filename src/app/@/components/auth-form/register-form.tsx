"use client"

import { useState } from "react"
import { cn } from "../../../../lib/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { signIn, useSession } from "next-auth/react"
import { registerUser } from "../../../services/Api/register"
import { useRouter } from "next/navigation"
import { sendOtp, verifyOtp } from '../../../services/Api/register';
import { Eye, CheckCircle2 } from 'lucide-react';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
    setError('') 
    
    // Reset OTP state when email changes
    if (e.target.id === 'email') {
      resetOtpState();
    }
  }

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setOtpError('');
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain both letters and numbers')
      return false
    }
    
    return true
  }

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    
    try {
      const result = await sendOtp(formData.email);
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
    } catch (err) {
      setOtpError(`Failed to send OTP: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOtpSent(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    
    try {
      const result = await verifyOtp(formData.email, otp);
      setOtpVerified(true);
      setOtpError('');
      setOtp('');
    } catch (err) {
      setOtpError('OTP is incorrect or has expired.');
      setOtpVerified(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpVerified) {
      setError('You need to verify your email with OTP before registering!');
      return;
    }
    
    if (!otpSent) {
      setError('You need to send the OTP first!');
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await registerUser(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push("/auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const result = await signIn('google', { callbackUrl: '/' })
      if (result?.error) setError('Google login failed: ' + result.error)
    } catch (err) {
      setError('Google login failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex justify-center">
          <h1 className="font-[Alkaline] text-5xl">Rilarte</h1>
        </div>
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create a new account
        </p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            type="text" 
            placeholder="johndoe" 
            value={formData.username}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div className="flex gap-2">
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={otpSent}
            />
            <Button type="button" onClick={handleSendOtp} disabled={otpLoading || !formData.email || otpSent} className="min-w-max">
              {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
            </Button>
          </div>
          {otpError && <div className="text-red-500 text-xs mt-1">{otpError}</div>}
        </div>
        {otpSent && !otpVerified && (
          <div className="grid gap-3">
            <Label htmlFor="otp">Enter OTP</Label>
            <div className="flex gap-2 items-center">
              <div className="relative w-full">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={4}
                  className="pr-20"
                />
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== 4}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                  variant="secondary"
                >
                  {otpLoading ? '...' : <span>Verify</span>}
                </Button>
              </div>
              <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otp.length !== 4} className="min-w-max hidden sm:inline-flex">
                {otpLoading ? 'Verifying...' : <CheckCircle2 size={16} className="mr-1" />} Verify
              </Button>
            </div>
            {otpError && <div className="text-red-500 text-xs mt-1">{otpError}</div>}
          </div>
        )}
        {otpVerified && (
          <div className="text-green-600 text-xs mb-2">Email verified successfully!</div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
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

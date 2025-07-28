"use client"

import { useState } from "react"
import { cn } from "../../../../lib/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { sendOtp, verifyOtp } from '../../../services/Api/register';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      setOtpError('Gửi mã OTP thất bại.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await verifyOtp(email, otp);
      setOtpVerified(true);
      setOtpError('');
    } catch (err) {
      setOtpError('Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!otpVerified) {
      setError('Bạn cần xác thực email bằng OTP trước khi đổi mật khẩu!');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:5001/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }
      setSuccess("Your password has been successfully reset.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email and choose a new password.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent}
            />
            <Button type="button" onClick={handleSendOtp} disabled={otpLoading || !email || otpSent} className="min-w-max">
              {otpLoading ? 'Đang gửi...' : otpSent ? 'Đã gửi' : 'Gửi mã'}
            </Button>
          </div>
          {otpError && <div className="text-red-500 text-xs mt-1">{otpError}</div>}
        </div>
        {otpSent && !otpVerified && (
          <div className="grid gap-3">
            <Label htmlFor="otp">Nhập mã OTP</Label>
            <div className="flex gap-2 items-center">
              <div className="relative w-full">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP"
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
                  {otpLoading ? '...' : <span>Xác thực</span>}
                </Button>
              </div>
              <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otp.length !== 4} className="min-w-max hidden sm:inline-flex">
                {otpLoading ? 'Đang xác thực...' : 'Xác thực'}
              </Button>
            </div>
            {otpError && <div className="text-red-500 text-xs mt-1">{otpError}</div>}
          </div>
        )}
        {otpVerified && (
          <div className="text-green-600 text-xs mb-2">Email đã xác thực thành công!</div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  )
}

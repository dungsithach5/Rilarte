  "use client"

import { useRouter, useSearchParams } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"
import { useState, useEffect } from "react"
import { LoginForm } from "../@/components/auth-form/login-form"
import { RegisterForm } from "../@/components/auth-form/register-form"
import { motion, AnimatePresence } from "framer-motion"

const images = [
  "/img/slide1.png",
  "/img/slide4.png",
  "/img/slide2.png",
  "/img/slide5.png",
]

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams?.get("mode") || "login"
  const [index, setIndex] = useState(0)

  const isLogin = mode === "login"

  const toggleMode = () => {
    const newMode = isLogin ? "register" : "login"
    router.push(`/auth?mode=${newMode}`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium font-[Alkaline]">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Rilarte.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {isLogin ? (
              <LoginForm />
            ) : (
              <RegisterForm />
            )}
            <div className="mt-4 text-center text-sm">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <AnimatePresence>
          <motion.img
            key={index}
            src={images[index]}
            alt={`Slide ${index}`}
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 4 }}
            exit={{ opacity: 3 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

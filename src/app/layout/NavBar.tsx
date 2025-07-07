'use client'

import { useSelector } from "react-redux"
import type { RootState } from "../context/store"
import Link from 'next/link'
import { signOut, useSession } from "next-auth/react"
import DropdownUser from "../@/components/dropdown-user"
import { useRouter } from 'next/navigation'

export function NavBar() {
  const { isAuthenticated, avatar } = useSelector((state: RootState) => state.user)
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth')
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3">
      <Link href="/" className="text-xl font-bold text-black">
        Elarte
      </Link>

      {(session || isAuthenticated) ? (
        <div className="flex items-center gap-4">
          <DropdownUser
            avatar={
              <img
                src={avatar || session?.user?.image || "/img/user.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            }
          />
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="px-5 py-2 font-semibold text-sm text-white bg-black rounded-full hover:bg-gray-800 cursor-pointer"
        >
          Login
        </button>
      )}
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { signOut, useSession } from "next-auth/react"

export function NavBar() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth' })
  }

  return (
    <nav className="w-full flex items-center justify-center px-6 py-3">
      <Link href="/" className="text-xl font-bold text-black">
        Elarte
      </Link>
      
      {session && (
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user?.name}</span>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

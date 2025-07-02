'use client'

import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="w-full flex items-center justify-center px-6 py-3">
      <Link href="/" className="text-xl font-bold text-black">
        Elarte
      </Link>
    </nav>
  )
}

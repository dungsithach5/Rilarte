"use client"

import { useAuth } from "../hooks/useAuth"

export default function ProfilePage() {
  const { session, status } = useAuth(true)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null // Will redirect to auth page
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Welcome {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
      {session.user?.image && (
        <img src={session.user.image} alt="Profile" className="w-20 h-20 rounded-full" />
      )}
    </div>
  )
}

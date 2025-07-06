"use client"

import Link from 'next/link'
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <div className="flex space-x-4 border-b">
        <Link href="/settings/edit-profile" className="pb-2 text-sm font-medium text-gray-600 hover:text-black focus:text-black focus:border-b-2 focus:border-black">Profile</Link>
        <Link href="/settings/account-settings" className="text-sm font-medium text-gray-600 hover:text-black focus:text-black focus:border-b-2 focus:border-black">Account</Link>
      </div>
      {children}
    </div>
  );
}

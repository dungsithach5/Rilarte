"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/settings/edit-profile",
      label: "Edit Profile",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: "Update your profile information and avatar"
    },
    {
      href: "/settings/account-settings",
      label: "Account Settings",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: "Manage your account and security settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your account preferences and profile information</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <nav className="space-y-2 sm:space-y-3">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white border-2 border-gray-800 shadow-lg shadow-gray-800/20'
                        : 'bg-white border-2 border-transparent hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {item.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold transition-colors duration-200 ${
                        isActive ? 'text-gray-900' : 'text-gray-900 group-hover:text-gray-700'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 transition-colors duration-200 ${
                        isActive ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-800 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Need Help?</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Contact our support team if you need assistance with your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

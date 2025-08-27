'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';
import BottomBar from './BottomBar';


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  const isAdminPage = pathname?.startsWith('/admin') || false;
  const isOnboardingPage = pathname === '/onboarding';

  const shouldHideBars = isAuthPage || isAdminPage || isOnboardingPage;

  return (
    <>
      {!shouldHideBars && <NavBar />}
        <main className="flex-1">{children}</main>
      {!shouldHideBars && <BottomBar />}
    </>
  );
}

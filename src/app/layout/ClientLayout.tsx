'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';
import BottomBar from './BottomBar';
import OnboardingModal from '../@/components/OnboardingModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  const isAdminPage = pathname.startsWith('/admin'); // sử dụng startsWith để bao phủ tất cả các route như /admin/dashboard, /admin/posts, v.v.

  const shouldHideBars = isAuthPage || isAdminPage;

  return (
    <>
      {!shouldHideBars && <NavBar />}
      <main className="flex-1">{children}</main>
      {!shouldHideBars && <BottomBar />}
      {/* <OnboardingModal /> */}
    </>
  );
}

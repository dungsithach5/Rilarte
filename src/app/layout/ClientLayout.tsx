'use client';

import { usePathname } from 'next/navigation';
import Navbar from './NavBar';
import BottomBar from './BottomBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideLayout = pathname === '/auth';

  return (
    <>
      {!hideLayout && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <BottomBar />}
    </>
  );
}

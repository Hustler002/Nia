'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopBar from '@/components/TopBar';
import UserStoreInitializer from './UserStoreInitializer';
import NiaProactiveScheduler from './NiaProactiveScheduler';
import ToastContainer from './ToastContainer';

// Dynamic imports to avoid SSR issues with Zustand stores
const NiaPanel = dynamic(() => import('@/components/NiaWidget/NiaPanel'), { ssr: false });
const NiaTrigger = dynamic(() => import('@/components/NiaWidget/NiaTrigger'), { ssr: false });
const MiniCart = dynamic(() => import('@/components/layout/MiniCart'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSellerRoute = pathname.startsWith('/seller');

  return (
    <>
      <UserStoreInitializer />
      {!isSellerRoute && (
        <>
          <TopBar />
          <NiaProactiveScheduler />
        </>
      )}
      {children}
      {!isSellerRoute && (
        <>
          <NiaPanel />
          <NiaTrigger />
          <MiniCart />
        </>
      )}
      <ToastContainer />
    </>
  );
}

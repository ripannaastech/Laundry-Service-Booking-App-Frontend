'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DeliverySidebar from './DeliverySidebar';
import DeliveryHeader from './DeliveryHeader';

interface DeliveryLayoutProps {
  children: ReactNode;
}

const DeliveryLayout = ({ children }: DeliveryLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (!token || !userStr) {
      router.push('/delivery/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'delivery') {
        router.push('/delivery/login');
        return;
      }
    } catch {
      router.push('/delivery/login');
      return;
    }
    
    setIsChecking(false);
  }, [checkAuth, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#148f77] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Verifying delivery access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DeliveryHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex pt-16">
        <DeliverySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-[calc(100vh-4rem)]">
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLayout;

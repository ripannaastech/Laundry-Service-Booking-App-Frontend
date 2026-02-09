'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  FiHome, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle,
  FiLogOut,
  FiX,
  FiUser,
  FiMapPin,
  FiClock
} from 'react-icons/fi';

interface DeliverySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeliverySidebar = ({ isOpen, onClose }: DeliverySidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/delivery' },
    { icon: FiPackage, label: 'Assigned Orders', href: '/delivery/assigned' },
    { icon: FiClock, label: 'Pickup', href: '/delivery/pickup' },
    { icon: FiTruck, label: 'In Transit', href: '/delivery/in-transit' },
    { icon: FiCheckCircle, label: 'Completed', href: '/delivery/completed' },
    { icon: FiMapPin, label: 'Route Map', href: '/delivery/route' },
    { icon: FiUser, label: 'Profile', href: '/delivery/profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/delivery') return pathname === '/delivery';
    return pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-[#0e6251] text-white transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:sticky lg:top-0 lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/delivery" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#148f77] rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">LaundryHub</h1>
              <p className="text-xs text-gray-300">Delivery Panel</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#148f77] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#0e6251]">
          <button
            onClick={() => {
              logout();
              router.push('/delivery/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DeliverySidebar;

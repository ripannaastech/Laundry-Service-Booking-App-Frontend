'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';

interface DeliveryHeaderProps {
  onMenuClick: () => void;
}

const DeliveryHeader = ({ onMenuClick }: DeliveryHeaderProps) => {
  const { isDark, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = () => {
    if (!user?.name) return 'D';
    const names = user.name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">Delivery Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {isDark ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
          </button>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {user?.profileImage ? (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <Image src={user.profileImage} alt={user.name || 'Delivery'} width={32} height={32} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0e6251] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{getInitials()}</span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'Delivery'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Partner</p>
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="py-2">
                    <a href="/delivery/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiUser className="w-4 h-4" />Profile
                    </a>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button onClick={() => { logout(); router.push('/delivery/login'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <FiLogOut className="w-4 h-4" />Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DeliveryHeader;

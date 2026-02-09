'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { 
  FiUser, 
  FiPackage, 
  FiMessageSquare, 
  FiCreditCard, 
  FiSettings, 
  FiLogOut, 
  FiChevronDown, 
  FiChevronUp,
  FiCamera,
  FiLock,
  FiBell,
  FiGlobe,
  FiMoon,
  FiDollarSign,
  FiHome,
  FiStar,
  FiTag
} from 'react-icons/fi';

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar = ({ className = '' }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const { t } = useTheme();
  const { user, logout } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(pathname.includes('/dashboard/settings'));

  const menuItems = [
    { icon: FiHome, label: t('dashboard') || 'Dashboard', href: '/dashboard' },
    { icon: FiUser, label: t('myProfile'), href: '/dashboard/profile' },
    { icon: FiPackage, label: t('myOrder'), href: '/dashboard/orders' },
    { icon: FiStar, label: 'reviews', href: '/dashboard/reviews' },
    { icon: FiTag, label: 'coupons', href: '/dashboard/coupons' },
    { icon: FiMessageSquare, label: t('chat'), href: '/dashboard/chat' },
    { icon: FiCreditCard, label: t('paymentMethod'), href: '/dashboard/payment-method' },
  ];

  const settingsItems = [
    { icon: FiLock, label: t('changePassword'), href: '/dashboard/settings/password' },
    { icon: FiBell, label: t('notification'), href: '/dashboard/settings/notification' },
    { icon: FiGlobe, label: t('language'), href: '/dashboard/settings/language' },
    { icon: FiMoon, label: t('theme'), href: '/dashboard/settings/theme' },
    { icon: FiDollarSign, label: t('currency'), href: '/dashboard/settings/currency' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };
  const isSettingsActive = pathname.includes('/dashboard/settings');

  return (
    <aside className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {/* Profile Section */}
      <div className="p-6 sm:p-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#0F7BA0]/20 shadow-lg overflow-hidden bg-linear-to-br from-[#0F2744] to-[#0F7BA0]">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.name || 'Profile'}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : user?.name ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser className="w-10 h-10 text-white/80" />
              </div>
            )}
          </div>
        </div>
        {user && (
          <div className="mt-3 text-center">
            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 sm:p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#0F2744] dark:bg-[#0F7BA0] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#0F2744] dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm sm:text-base">{item.label}</span>
              </Link>
            </li>
          ))}

          {/* Settings with submenu */}
          <li>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isSettingsActive
                  ? 'bg-[#0F2744] dark:bg-[#0F7BA0] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#0F2744] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FiSettings className="w-5 h-5" />
                <span className="text-sm sm:text-base">{t('settings')}</span>
              </div>
              {settingsOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </button>
            {settingsOpen && (
              <ul className="mt-1 ms-4 space-y-1 animate-fade-in">
                {settingsItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'text-[#0F7BA0] dark:text-[#0F7BA0] font-medium bg-[#0F7BA0]/10'
                          : 'text-gray-600 dark:text-gray-400 hover:text-[#0F2744] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Logout */}
          <li>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="text-sm sm:text-base">{t('logout')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;

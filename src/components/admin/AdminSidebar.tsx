'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiTruck, 
  FiDollarSign, 
  FiTag, 
  FiBarChart2, 
  FiStar, 
  FiSettings, 
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiFileText,
  FiMapPin,
  FiShield,
  FiBell
} from 'react-icons/fi';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(pathname.includes('/admin/settings'));

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/admin' },
    { icon: FiShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: FiUsers, label: 'Users', href: '/admin/users' },
    { icon: FiPackage, label: 'Services', href: '/admin/services' },
    { icon: FiMapPin, label: 'Stores', href: '/admin/stores' },
    { icon: FiTruck, label: 'Delivery', href: '/admin/delivery' },
    { icon: FiDollarSign, label: 'Payments', href: '/admin/payments' },
    { icon: FiTag, label: 'Coupons', href: '/admin/coupons' },
    { icon: FiBarChart2, label: 'Reports', href: '/admin/reports' },
    { icon: FiStar, label: 'Reviews', href: '/admin/reviews' },
  ];

  const settingsItems = [
    { icon: FiSettings, label: 'General', href: '/admin/settings' },
    { icon: FiDollarSign, label: 'Payment', href: '/admin/settings/payment' },
    { icon: FiMapPin, label: 'Location & Pricing', href: '/admin/settings/location' },
    { icon: FiFileText, label: 'Pages', href: '/admin/settings/pages' },
    { icon: FiShield, label: 'Roles', href: '/admin/settings/roles' },
    { icon: FiBell, label: 'Notifications', href: '/admin/settings/notifications' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-[#0F2744] text-white transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:sticky lg:top-0 lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0F7BA0] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">LaundryHub</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#0F7BA0] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Settings Dropdown */}
            <li>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  pathname.includes('/admin/settings')
                    ? 'bg-[#0F7BA0] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiSettings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </div>
                {settingsOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              
              {settingsOpen && (
                <ul className="mt-1 ml-4 space-y-1">
                  {settingsItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          pathname === item.href
                            ? 'text-[#0F7BA0] bg-white/10 font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
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
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 bg-[#0F2744]">
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
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

export default AdminSidebar;

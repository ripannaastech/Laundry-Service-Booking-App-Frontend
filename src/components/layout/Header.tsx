'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { FiUser, FiLogOut, FiGrid } from 'react-icons/fi';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useTheme();
  const { user, logout, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  const navItems = [
    { label: t('home'), href: '/' },
    { label: t('services'), href: '/services' },
    { label: 'Stores', href: '/stores' },
    { label: t('aboutUs'), href: '/about' },
    { label: t('contactUs'), href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const onLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/30 py-3'
          : 'bg-white/95 dark:bg-gray-900/95 py-4'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-35 h-10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/Images/logo/header.png"
                alt="Ultra Wash Logo"
                fill
                className="object-contain dark:brightness-0 dark:invert"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 lg:gap-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#5a6a7a] dark:text-gray-300 font-medium transition-all duration-300 hover:text-[#1A3A5D] dark:hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#1A3A5D] dark:after:bg-[#0F7BA0] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Login/Profile Button */}
          <div className="hidden md:block relative" ref={profileRef}>
            {isAuthenticated && user ? (
              <div>
                {/* Profile Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 bg-[#0f2744] dark:bg-[#0F7BA0] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-[#1a3a5c] dark:hover:bg-[#0d6a8c] hover:shadow-lg"
                >
                  {user.profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/30">
                      <Image
                        src={user.profileImage}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      {getUserInitials()}
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in-up z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                      {user.profileImage ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={user.profileImage}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0f2744] dark:bg-[#0F7BA0] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {getUserInitials()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0f2744] dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5a6a7a] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiGrid className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5a6a7a] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-[#0f2744] dark:bg-[#0F7BA0] text-white px-16 py-3 rounded font-semibold transition-all duration-300 hover:bg-[#1a3a5c] dark:hover:bg-[#0d6a8c] hover:shadow-lg hover:-translate-y-0.5"
              >
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span
              className={`w-6 h-0.5 bg-[#0f2744] dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#0f2744] dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#0f2744] dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
            ></span>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/30 transition-all duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 visible translate-y-0'
              : 'opacity-0 invisible -translate-y-4' 
          }`}
        >
          <div className="flex flex-col p-4 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#5a6a7a] dark:text-gray-300 font-medium py-2 hover:text-[#1A3A5D] dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-2">
                  <p className="text-sm font-semibold text-[#0f2744] dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                </div>
                
                {/* Dashboard Links */}
                <Link 
                  href="/dashboard/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-[#5a6a7a] dark:text-gray-300 font-medium py-2 hover:text-[#1A3A5D] dark:hover:text-white transition-colors"
                >
                  <FiGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-[#5a6a7a] dark:text-gray-300 font-medium py-2 hover:text-[#1A3A5D] dark:hover:text-white transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                
                {/* Logout Button */}
                <button 
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-red-600 dark:bg-red-500 text-white px-16 py-3 rounded font-semibold w-full hover:bg-red-700 dark:hover:bg-red-600 transition-colors mt-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-[#0f2744] dark:bg-[#0F7BA0] text-white px-16 py-3 rounded font-semibold w-full text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiLoader, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

const DeliveryDashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ assigned: 0, pickedUp: 0, inTransit: 0, completed: 0 });
  const [todayOrders, setTodayOrders] = useState<{ _id: string; orderId: string; status: string; address?: string; customerName?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get delivery-specific stats
        const res = await api.get('/orders/delivery-stats');
        if (res.data.status === 'success') {
          const d = res.data.data;
          setStats({
            assigned: d.assigned || 0,
            pickedUp: d.pickedUp || 0,
            inTransit: d.inTransit || 0,
            completed: d.completed || 0,
          });
          setTodayOrders(d.todayOrders || []);
        }
      } catch {
        // Fallback: use general dashboard stats
        try {
          const res = await api.get('/orders/dashboard-stats');
          if (res.data.status === 'success') {
            const d = res.data.data;
            setStats({
              assigned: d.activeOrders || 0,
              pickedUp: 0,
              inTransit: 0,
              completed: d.completedOrders || 0,
            });
          }
        } catch { /* */ }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-linear-to-r from-[#0e6251] to-[#148f77] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold">{getGreeting()}, {user?.name || 'Delivery Partner'}! 🚚</h1>
          <p className="text-green-100 mt-1 text-sm">Here&apos;s your delivery overview for today</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#148f77] animate-spin" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Assigned</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.assigned}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Picked Up</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pickedUp}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FiTruck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inTransit}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today&apos;s Deliveries</h2>
                <Link href="/delivery/assigned" className="text-sm text-[#148f77] hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {todayOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No deliveries assigned for today</p>
                    <p className="text-xs text-gray-400 mt-1">New deliveries will appear here when admin assigns them</p>
                  </div>
                ) : (
                  todayOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <FiMapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{order.orderId}</p>
                          <p className="text-xs text-gray-500">{order.customerName || 'Customer'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryDashboardPage;

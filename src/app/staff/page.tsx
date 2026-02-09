'use client';

import { useState, useEffect } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { FiShoppingBag, FiCheckCircle, FiClock, FiXCircle, FiLoader, FiPackage } from 'react-icons/fi';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface RecentOrder {
  _id: string;
  orderId: string;
  customerName: string;
  status: string;
  totalPayment: number;
  orderDate: string;
}

const StaffDashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/orders/dashboard-stats');
        if (res.data.status === 'success') {
          const d = res.data.data;
          setStats({
            totalOrders: d.totalOrders || 0,
            pendingOrders: d.activeOrders || 0,
            completedOrders: d.completedOrders || 0,
            cancelledOrders: d.cancelledOrders || 0,
          });
          setRecentOrders(d.latestOrders || []);
        }
      } catch {
        // silently fail
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'picked_up': case 'in_process': case 'ready': case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delivered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-linear-to-r from-[#1a5276] to-[#2e86c1] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold">{getGreeting()}, {user?.name || 'Staff'}! 👋</h1>
          <p className="text-blue-100 mt-1 text-sm">Here&apos;s your work overview for today</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FiLoader className="w-8 h-8 text-[#2e86c1] animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FiXCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelledOrders}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                <Link href="/staff/orders" className="text-sm text-[#2e86c1] hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                ) : (
                  recentOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{order.orderId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">${order.totalPayment?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffDashboardPage;

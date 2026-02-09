'use client';

import { useState, useEffect } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import api from '@/services/api';
import { FiSearch, FiEye, FiLoader, FiPackage, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  status: string;
  totalPayment: number;
  orderDate: string;
  deliveryDate?: string;
}

const StaffOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      if (res.data.status === 'success') {
        setOrders(res.data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': case 'picked_up': case 'in_process': return 'bg-blue-100 text-blue-700';
      case 'ready': case 'out_for_delivery': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statuses = ['pending', 'confirmed', 'picked_up', 'in_process', 'ready', 'out_for_delivery', 'delivered'];

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-[#1a5276] text-white rounded-xl text-sm hover:bg-[#154360] transition-colors">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#2e86c1] outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm">
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#2e86c1] animate-spin" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.orderId}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">${order.totalPayment?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          >
                            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                          </select>
                          {updatingId === order._id && <FiLoader className="w-4 h-4 animate-spin text-[#2e86c1]" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffOrdersPage;

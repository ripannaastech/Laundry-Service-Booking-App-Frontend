'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import api from '@/services/api';
import { FiLoader, FiCheckCircle, FiCalendar } from 'react-icons/fi';

interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; phone?: string };
  status: string;
  totalPayment: number;
  orderDate: string;
  items: { name: string; quantity: number }[];
}

const CompletedPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.status === 'success') {
          const completedOrders = (res.data.data || []).filter((o: Order) => o.status === 'delivered');
          setOrders(completedOrders);
        }
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    if (filter === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    // week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return orderDate >= weekAgo;
  });

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-6 h-6 text-[#148f77]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completed Deliveries</h1>
              <p className="text-sm text-gray-500">{filteredOrders.length} deliveries</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['today', 'week', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-[#0e6251] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}>
              {f === 'week' ? 'This Week' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#148f77] animate-spin" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiCheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No completed deliveries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{order.orderId}</h3>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ Delivered</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">৳{order.totalPayment}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {order.items?.map((item, i) => (
                    <span key={i} className="text-xs text-gray-400 mr-2">{item.quantity}x {item.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default CompletedPage;

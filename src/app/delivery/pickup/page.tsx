'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import api from '@/services/api';
import { FiLoader, FiPackage, FiNavigation } from 'react-icons/fi';

interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; phone?: string };
  status: string;
  totalPayment: number;
  orderDate: string;
  items: { name: string; quantity: number }[];
}

const PickupPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.status === 'success') {
          const pickupOrders = (res.data.data || []).filter((o: Order) =>
            ['confirmed', 'picked_up'].includes(o.status)
          );
          setOrders(pickupOrders);
        }
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handlePickup = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'picked_up' });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'picked_up' } : o));
    } catch { alert('Failed to update'); }
  };

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pickup Orders</h1>
        <p className="text-sm text-gray-500">Orders waiting to be picked up from customers</p>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#148f77] animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pickup orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{order.orderId}</h3>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'picked_up' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status === 'picked_up' ? '✅ Picked Up' : '📦 Awaiting Pickup'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                  {order.items?.map((item, i) => (
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{item.quantity}x {item.name}</p>
                  ))}
                </div>
                {order.status === 'confirmed' && (
                  <button onClick={() => handlePickup(order._id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0e6251] text-white rounded-xl font-medium text-sm hover:bg-[#0b4f42] transition-colors">
                    <FiNavigation className="w-4 h-4" /> Mark as Picked Up
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default PickupPage;

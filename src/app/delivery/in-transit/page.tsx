'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import api from '@/services/api';
import { FiLoader, FiTruck, FiCheckCircle, FiPhone } from 'react-icons/fi';

interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; phone?: string; address?: string };
  status: string;
  totalPayment: number;
  orderDate: string;
  items: { name: string; quantity: number }[];
}

const InTransitPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.status === 'success') {
          const transitOrders = (res.data.data || []).filter((o: Order) => o.status === 'out_for_delivery');
          setOrders(transitOrders);
        }
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handleDelivered = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'delivered' });
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch { alert('Failed to update'); }
  };

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FiTruck className="w-6 h-6 text-[#148f77]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">In Transit</h1>
            <p className="text-sm text-gray-500">Orders currently being delivered</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#148f77] animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders in transit</p>
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
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">🚚 In Transit</span>
                </div>

                {order.user?.address && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-1">Delivery Address</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{order.user.address}</p>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-1">Items</p>
                  {order.items?.map((item, i) => (
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{item.quantity}x {item.name}</p>
                  ))}
                </div>

                <div className="flex gap-3">
                  {order.user?.phone && (
                    <a href={`tel:${order.user.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
                      <FiPhone className="w-4 h-4" /> Call Customer
                    </a>
                  )}
                  <button onClick={() => handleDelivered(order._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0e6251] text-white rounded-xl font-medium text-sm hover:bg-[#0b4f42] transition-colors">
                    <FiCheckCircle className="w-4 h-4" /> Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default InTransitPage;

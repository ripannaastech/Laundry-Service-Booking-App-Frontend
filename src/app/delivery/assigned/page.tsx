'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import api from '@/services/api';
import { FiLoader, FiPackage, FiMapPin, FiPhone, FiNavigation } from 'react-icons/fi';

interface AssignedOrder {
  _id: string;
  orderId: string;
  user?: { name: string; phone?: string; address?: string };
  status: string;
  totalPayment: number;
  orderDate: string;
  deliveryAddress?: string;
  items: { name: string; quantity: number }[];
}

const AssignedOrdersPage = () => {
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders?status=confirmed,picked_up,ready,out_for_delivery');
        if (res.data.status === 'success') setOrders(res.data.data || []);
      } catch {
        try {
          const res = await api.get('/orders');
          if (res.data.status === 'success') {
            const active = (res.data.data || []).filter((o: AssignedOrder) =>
              ['confirmed', 'picked_up', 'in_process', 'ready', 'out_for_delivery'].includes(o.status)
            );
            setOrders(active);
          }
        } catch { /* */ }
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch { alert('Failed to update status'); }
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = {
      'confirmed': 'picked_up',
      'picked_up': 'in_process',
      'in_process': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered',
    };
    return flow[current] || '';
  };

  const getNextLabel = (current: string) => {
    const labels: Record<string, string> = {
      'confirmed': '📦 Mark as Picked Up',
      'picked_up': '🔄 Start Processing',
      'in_process': '✅ Mark as Ready',
      'ready': '🚚 Out for Delivery',
      'out_for_delivery': '✅ Mark Delivered',
    };
    return labels[current] || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'picked_up': return 'bg-indigo-100 text-indigo-700';
      case 'in_process': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-orange-100 text-orange-700';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#148f77] animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assigned orders</p>
            <p className="text-xs text-gray-400 mt-1">Orders assigned by admin will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{order.orderId}</h3>
                      <p className="text-sm text-gray-500 mt-1">{order.user?.name || 'Customer'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{item.quantity}x {item.name}</p>
                    ))}
                    {(order.items?.length || 0) > 3 && <p className="text-xs text-gray-400">+{order.items.length - 3} more</p>}
                  </div>

                  {/* Address & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {order.user?.phone && (
                        <a href={`tel:${order.user.phone}`} className="flex items-center gap-1 text-sm text-[#148f77] hover:underline">
                          <FiPhone className="w-4 h-4" /> Call
                        </a>
                      )}
                      {order.deliveryAddress && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <FiMapPin className="w-4 h-4" /> {order.deliveryAddress}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-[#148f77]">${order.totalPayment?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Button */}
                {getNextStatus(order.status) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                    <button
                      onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#0e6251] text-white rounded-xl font-medium text-sm hover:bg-[#0b4f42] transition-colors"
                    >
                      <FiNavigation className="w-4 h-4" />
                      {getNextLabel(order.status)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default AssignedOrdersPage;

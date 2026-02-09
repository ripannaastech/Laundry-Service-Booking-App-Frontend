'use client';

import { useState, useEffect } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import api from '@/services/api';
import { FiLoader, FiPackage } from 'react-icons/fi';

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  items: { _id: string; name: string; price: number }[];
}

const StaffServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.status === 'success') setServices(res.data.data || []);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#2e86c1] animate-spin" /></div>
        ) : services.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items ({service.items?.length || 0}):</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {service.items?.slice(0, 5).map((item) => (
                        <div key={item._id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {(service.items?.length || 0) > 5 && (
                        <p className="text-xs text-gray-400">+{service.items.length - 5} more items</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffServicesPage;

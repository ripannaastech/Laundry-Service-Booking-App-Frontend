'use client';

import StaffLayout from '@/components/staff/StaffLayout';
import { FiUsers } from 'react-icons/fi';

const StaffCustomersPage = () => {
  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Customer management coming soon</p>
          <p className="text-xs text-gray-400 mt-2">Admin will assign customer management roles to you</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffCustomersPage;

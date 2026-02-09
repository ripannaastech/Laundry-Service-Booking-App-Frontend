'use client';

import StaffLayout from '@/components/staff/StaffLayout';
import { FiMessageSquare } from 'react-icons/fi';

const StaffMessagesPage = () => {
  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
          <p className="text-xs text-gray-400 mt-2">Customer and admin messages will appear here</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffMessagesPage;

'use client';

import { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLoader, FiCamera } from 'react-icons/fi';

const DeliveryProfilePage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: 'bike',
    vehicleNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        vehicleType: 'bike',
        vehicleNumber: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { alert('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <DeliveryLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>
        )}

        {/* Avatar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#0e6251] flex items-center justify-center text-white text-2xl font-bold">
              {formData.name?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <FiCamera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{formData.name || 'Delivery Person'}</h2>
            <p className="text-sm text-[#148f77] font-medium">Delivery Staff</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="name" value={formData.name} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#148f77] outline-none text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="email" value={formData.email} onChange={handleChange} disabled
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="phone" value={formData.phone} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#148f77] outline-none text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="address" value={formData.address} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#148f77] outline-none text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#148f77] outline-none text-gray-900 dark:text-white">
                <option value="bike">🏍️ Bike</option>
                <option value="bicycle">🚲 Bicycle</option>
                <option value="car">🚗 Car</option>
                <option value="van">🚐 Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Number</label>
              <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="e.g. DH-1234"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-[#148f77] outline-none text-gray-900 dark:text-white" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0e6251] text-white rounded-xl font-medium text-sm hover:bg-[#0b4f42] transition-colors disabled:opacity-50">
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryProfilePage;

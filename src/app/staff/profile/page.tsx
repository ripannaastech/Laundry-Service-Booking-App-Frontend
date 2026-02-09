'use client';

import { useState } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import { useAuthStore } from '@/store/authStore';
import { FiUser, FiMail, FiPhone, FiSave, FiLoader } from 'react-icons/fi';

const StaffProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Call API to update profile
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <StaffLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-[#1a5276] flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Staff Member</p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiUser className="w-4 h-4" /> Full Name
              </label>
              {isEditing ? (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm" />
              ) : (
                <p className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">{user?.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiMail className="w-4 h-4" /> Email
              </label>
              <p className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiPhone className="w-4 h-4" /> Phone
              </label>
              {isEditing ? (
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm" />
              ) : (
                <p className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">{user?.phone || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1a5276] text-white rounded-xl text-sm font-medium hover:bg-[#154360] disabled:opacity-50">
                  {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-[#1a5276] text-white rounded-xl text-sm font-medium hover:bg-[#154360]">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffProfilePage;

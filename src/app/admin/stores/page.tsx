'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import { 
  FiSearch, 
  FiPlus,
  FiEdit2, 
  FiTrash2,
  FiX,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiLoader,
  FiStar
} from 'react-icons/fi';
import { useStoreStore, Store, CreateStoreData, UpdateStoreData, OperatingHour } from '@/store/storeStore';

const defaultOperatingHours: OperatingHour[] = [
  { day: 'monday', openTime: '08:00', closeTime: '22:30', isClosed: false },
  { day: 'tuesday', openTime: '08:00', closeTime: '22:30', isClosed: false },
  { day: 'wednesday', openTime: '08:00', closeTime: '22:30', isClosed: false },
  { day: 'thursday', openTime: '08:00', closeTime: '22:30', isClosed: false },
  { day: 'friday', openTime: '08:00', closeTime: '22:30', isClosed: false },
  { day: 'saturday', openTime: '09:00', closeTime: '22:00', isClosed: false },
  { day: 'sunday', openTime: '10:00', closeTime: '20:00', isClosed: false },
];

const AdminStoresPage = () => {
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    area: '',
    city: '',
    zipCode: '',
    country: 'Bangladesh',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    image: '',
    features: '',
    isFeatured: false,
    isActive: true,
    sortOrder: '0',
  });
  const [formHours, setFormHours] = useState<OperatingHour[]>(defaultOperatingHours);

  const {
    allAdminStores,
    isAdminLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    success,
    getAdminStores,
    createStore,
    updateStore,
    deleteStore,
    clearError,
    clearSuccess,
  } = useStoreStore();

  // Fetch stores on mount
  useEffect(() => {
    getAdminStores();
  }, [getAdminStores]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        clearSuccess();
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearSuccess, clearError]);

  // Filter stores
  const filteredStores = allAdminStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === 'all' ? true :
                         filterActive === 'active' ? store.isActive : !store.isActive;
    return matchesSearch && matchesFilter;
  });

  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      area: '',
      city: '',
      zipCode: '',
      country: 'Bangladesh',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      image: '',
      features: '',
      isFeatured: false,
      isActive: true,
      sortOrder: '0',
    });
    setFormHours(defaultOperatingHours);
    setShowStoreModal(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    const [lng, lat] = store.location.coordinates;
    setFormData({
      name: store.name,
      description: store.description,
      address: store.address,
      area: store.area,
      city: store.city,
      zipCode: store.zipCode,
      country: store.country,
      latitude: lat.toString(),
      longitude: lng.toString(),
      phone: store.phone,
      email: store.email,
      image: store.image,
      features: store.features.join(', '),
      isFeatured: store.isFeatured,
      isActive: store.isActive,
      sortOrder: store.sortOrder.toString(),
    });
    setFormHours(store.operatingHours.length > 0 ? store.operatingHours : defaultOperatingHours);
    setShowStoreModal(true);
  };

  const handleSaveStore = async () => {
    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
    
    if (editingStore) {
      // Update existing store
      const updateData: UpdateStoreData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone,
        email: formData.email,
        image: formData.image,
        features: featuresArray,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder),
      };
      
      const success = await updateStore(editingStore._id, updateData);
      if (success) {
        setShowStoreModal(false);
      }
    } else {
      // Create new store
      const createData: CreateStoreData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone,
        email: formData.email,
        image: formData.image,
        features: featuresArray,
        isFeatured: formData.isFeatured,
        sortOrder: parseInt(formData.sortOrder),
        operatingHours: formHours,
      };
      
      const success = await createStore(createData);
      if (success) {
        setShowStoreModal(false);
      }
    }
  };

  const handleDeleteStore = async () => {
    if (deleteTarget) {
      const success = await deleteStore(deleteTarget);
      if (success) {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }
    }
  };

  const handleHoursChange = (index: number, field: keyof OperatingHour, value: string | boolean) => {
    const newHours = [...formHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormHours(newHours);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Store Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all store locations
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F7BA0] text-white rounded-lg hover:bg-[#0d6a8a] transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Add Store
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7BA0]"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F7BA0]"
          >
            <option value="all">All Stores</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Stores Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {isAdminLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-[#0F7BA0]" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No stores found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={store.image || '/Images/Home/service-section/service-1.jpg'}
                              alt={store.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                            <div className="text-sm text-gray-500">{store.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{store.area}</div>
                        <div className="text-sm text-gray-500">{store.city}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{store.phone}</div>
                        <div className="text-sm text-gray-500">{store.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{store.rating || 0}</span>
                          <span className="text-sm text-gray-500">({store.totalReviews})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            store.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {store.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {store.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(store)}
                            className="p-2 text-gray-500 hover:text-[#0F7BA0] transition-colors"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(store._id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Store Modal */}
        {showStoreModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingStore ? 'Edit Store' : 'Add New Store'}
                </h2>
                <button
                  onClick={() => setShowStoreModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Clean & Fresh Laundry - Gulshan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="gulshan@ultrawash.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Premium laundry service..."
                  />
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Plot #25, Road #11, Block-H"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Area *
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Gulshan 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="1212"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+8801887905213"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="23.7945"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="90.4143"
                    />
                  </div>
                </div>

                {/* Image & Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="https://example.com/store.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Features (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Free Pickup, Express Delivery, Dry Cleaning"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`p-1 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      {formData.isActive ? (
                        <FiToggleRight className="w-6 h-6 text-white" />
                      ) : (
                        <FiToggleLeft className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                      className={`p-1 rounded-full ${formData.isFeatured ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      {formData.isFeatured ? (
                        <FiToggleRight className="w-6 h-6 text-white" />
                      ) : (
                        <FiToggleLeft className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Sort Order:</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      className="w-20 px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                {!editingStore && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiClock className="w-5 h-5" />
                      Operating Hours
                    </h3>
                    <div className="space-y-2">
                      {formHours.map((hours, index) => (
                        <div key={hours.day} className="flex items-center gap-3 flex-wrap">
                          <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {hours.day}
                          </span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.isClosed}
                              onChange={(e) => handleHoursChange(index, 'isClosed', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
                          </label>
                          {!hours.isClosed && (
                            <>
                              <input
                                type="time"
                                value={hours.openTime}
                                onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={hours.closeTime}
                                onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t dark:border-gray-600 flex justify-end gap-3">
                <button
                  onClick={() => setShowStoreModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStore}
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-[#0F7BA0] text-white rounded-lg hover:bg-[#0d6a8a] disabled:opacity-50 flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && <FiLoader className="w-4 h-4 animate-spin" />}
                  {editingStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Store</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this store? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStore}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting && <FiLoader className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStoresPage;

import { create } from 'zustand';
import api from '@/services/api';

// Types
export interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Store {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  image: string;
  images: string[];
  rating: number;
  totalReviews: number;
  operatingHours: OperatingHour[];
  services: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  manager: string | null;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  name: string;
  description: string;
  address: string;
  area: string;
  city: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  image?: string;
  images?: string[];
  features?: string[];
  isFeatured?: boolean;
  sortOrder?: number;
  services?: string[];
  operatingHours?: OperatingHour[];
}

export interface UpdateStoreData {
  name?: string;
  description?: string;
  address?: string;
  area?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  image?: string;
  images?: string[];
  rating?: number;
  features?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface StoreState {
  // Data
  stores: Store[];
  nearbyStores: Store[];
  allAdminStores: Store[];
  selectedStore: Store | null;
  pagination: Pagination | null;
  userLocation: UserLocation | null;

  // Loading states
  isLoading: boolean;
  isNearbyLoading: boolean;
  isDetailLoading: boolean;
  isAdminLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  success: string | null;

  // PUBLIC APIs
  getStores: (params?: {
    search?: string;
    city?: string;
    area?: string;
    featured?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => Promise<void>;

  getNearbyStores: (lat: number, lng: number, radius?: number) => Promise<boolean>;

  getStoreBySlug: (slug: string) => Promise<void>;

  // ADMIN APIs
  getAdminStores: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;

  createStore: (data: CreateStoreData) => Promise<boolean>;

  updateStore: (id: string, data: UpdateStoreData) => Promise<boolean>;

  deleteStore: (id: string) => Promise<boolean>;

  // Location
  getUserLocation: () => Promise<boolean>;
  setUserLocation: (location: UserLocation) => void;

  // Utils
  clearSelectedStore: () => void;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  // Initial state
  stores: [],
  nearbyStores: [],
  allAdminStores: [],
  selectedStore: null,
  pagination: null,
  userLocation: null,
  isLoading: false,
  isNearbyLoading: false,
  isDetailLoading: false,
  isAdminLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  success: null,

  // ==========================================
  // PUBLIC APIs (No Auth Required)
  // ==========================================

  // GET /api/v1/stores - Get all active stores with filters
  getStores: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.city) queryParams.append('city', params.city);
      if (params?.area) queryParams.append('area', params.area);
      if (params?.featured) queryParams.append('featured', params.featured);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const url = `/stores${queryString ? `?${queryString}` : ''}`;

      console.log('📤 GET /stores Request:', url);
      const response = await api.get(url);
      console.log('✅ GET /stores Response:', response.data);

      if (response.data.status === 'success') {
        set({
          stores: response.data.data,
          pagination: response.data.pagination,
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error('❌ GET /stores Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to fetch stores',
        isLoading: false,
      });
    }
  },

  // GET /api/v1/stores/nearby - Get nearby stores by location
  getNearbyStores: async (lat, lng, radius = 10) => {
    set({ isNearbyLoading: true, error: null });
    try {
      const url = `/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      console.log('📤 GET /stores/nearby Request:', url);
      const response = await api.get(url);
      console.log('✅ GET /stores/nearby Response:', response.data);

      if (response.data.status === 'success') {
        set({
          nearbyStores: response.data.data,
          isNearbyLoading: false,
        });
        return response.data.data.length > 0;
      }
      set({ isNearbyLoading: false });
      return false;
    } catch (error: any) {
      console.error('❌ GET /stores/nearby Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to fetch nearby stores',
        isNearbyLoading: false,
        nearbyStores: [],
      });
      return false;
    }
  },

  // GET /api/v1/stores/:slug - Get single store by slug
  getStoreBySlug: async (slug) => {
    set({ isDetailLoading: true, error: null });
    try {
      console.log('📤 GET /stores/:slug Request:', `/stores/${slug}`);
      const response = await api.get(`/stores/${slug}`);
      console.log('✅ GET /stores/:slug Response:', response.data);

      if (response.data.status === 'success') {
        set({
          selectedStore: response.data.data,
          isDetailLoading: false,
        });
      }
    } catch (error: any) {
      console.error('❌ GET /stores/:slug Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Store not found',
        isDetailLoading: false,
      });
    }
  },

  // ==========================================
  // ADMIN APIs (Auth + Admin Required)
  // ==========================================

  // GET /api/v1/admin/stores - Get all stores (inc. inactive)
  getAdminStores: async (params) => {
    set({ isAdminLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = `/admin/stores${queryString ? `?${queryString}` : ''}`;

      console.log('📤 GET /admin/stores Request:', url);
      const response = await api.get(url);
      console.log('✅ GET /admin/stores Response:', response.data);

      if (response.data.status === 'success') {
        set({
          allAdminStores: response.data.data,
          pagination: response.data.pagination,
          isAdminLoading: false,
        });
      }
    } catch (error: any) {
      console.error('❌ GET /admin/stores Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to fetch admin stores',
        isAdminLoading: false,
      });
    }
  },

  // POST /api/v1/admin/stores - Create new store
  createStore: async (data) => {
    set({ isCreating: true, error: null, success: null });
    try {
      console.log('📤 POST /admin/stores Request:', data);
      const response = await api.post('/admin/stores', data);
      console.log('✅ POST /admin/stores Response:', response.data);

      if (response.data.status === 'success') {
        set({
          isCreating: false,
          success: 'Store created successfully',
        });
        // Refresh admin stores list
        get().getAdminStores();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ POST /admin/stores Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to create store',
        isCreating: false,
      });
      return false;
    }
  },

  // PUT /api/v1/admin/stores/:id - Update store
  updateStore: async (id, data) => {
    set({ isUpdating: true, error: null, success: null });
    try {
      console.log('📤 PUT /admin/stores/:id Request:', { id, data });
      const response = await api.put(`/admin/stores/${id}`, data);
      console.log('✅ PUT /admin/stores/:id Response:', response.data);

      if (response.data.status === 'success') {
        set({
          isUpdating: false,
          success: 'Store updated successfully',
        });
        // Refresh admin stores list
        get().getAdminStores();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ PUT /admin/stores/:id Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to update store',
        isUpdating: false,
      });
      return false;
    }
  },

  // DELETE /api/v1/admin/stores/:id - Delete store
  deleteStore: async (id) => {
    set({ isDeleting: true, error: null, success: null });
    try {
      console.log('📤 DELETE /admin/stores/:id Request:', id);
      const response = await api.delete(`/admin/stores/${id}`);
      console.log('✅ DELETE /admin/stores/:id Response:', response.data);

      if (response.data.status === 'success') {
        set({
          isDeleting: false,
          success: 'Store deleted successfully',
        });
        // Refresh admin stores list
        get().getAdminStores();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ DELETE /admin/stores/:id Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to delete store',
        isDeleting: false,
      });
      return false;
    }
  },

  // ==========================================
  // Location Functions
  // ==========================================

  // Get user's current GPS location
  getUserLocation: async () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        console.log('❌ Geolocation not supported');
        set({ error: 'Geolocation is not supported by your browser' });
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 User Location:', { lat: latitude, lng: longitude });

          // Reverse geocode to get address using Google Maps API
          let address = '';
          try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
              const geocodeRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              const geocodeData = await geocodeRes.json();
              if (geocodeData.results?.[0]) {
                address = geocodeData.results[0].formatted_address;
              }
            }
          } catch (err) {
            console.log('Reverse geocoding failed, using coordinates only');
          }

          set({
            userLocation: { lat: latitude, lng: longitude, address },
          });
          resolve(true);
        },
        (error) => {
          // Silently handle geolocation errors - don't show error to user
          console.log('Location access not available:', error.message);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  // ==========================================
  // Utility Functions
  // ==========================================

  clearSelectedStore: () => {
    set({ selectedStore: null });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSuccess: () => {
    set({ success: null });
  },
}));

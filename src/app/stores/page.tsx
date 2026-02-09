'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiMapPin, FiStar, FiClock, FiPhone, FiNavigation } from 'react-icons/fi';
import { useStoreStore, Store } from '@/store/storeStore';

// Google Maps Script Loader
const loadGoogleMapsScript = (callback: () => void) => {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    callback();
    return;
  }
  
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    existingScript.addEventListener('load', callback);
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
};

const StoresPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const {
    stores,
    nearbyStores,
    userLocation,
    isLoading,
    isNearbyLoading,
    error,
    getStores,
    getNearbyStores,
    getUserLocation,
    clearError,
  } = useStoreStore();

  // Display stores - prefer nearby if available, else all stores
  const displayStores = nearbyStores.length > 0 ? nearbyStores : stores;

  // Load Google Maps
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setIsMapLoaded(true);
    });
  }, []);

  // Get user location and fetch stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      // Try to get user location
      const locationSuccess = await getUserLocation();
      
      if (locationSuccess) {
        // If location available, get nearby stores
        const { userLocation } = useStoreStore.getState();
        if (userLocation) {
          await getNearbyStores(userLocation.lat, userLocation.lng, 10);
        }
      }
      
      // Always fetch all stores as fallback
      await getStores();
    };

    initializeStores();
  }, [getUserLocation, getNearbyStores, getStores]);

  // Initialize map when loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const defaultCenter = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: 23.7945, lng: 90.4143 }; // Dhaka default

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Add user location marker if available
    if (userLocation) {
      new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
    }
  }, [isMapLoaded, userLocation]);

  // Update markers when stores change
  useEffect(() => {
    if (!googleMapRef.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add store markers
    displayStores.forEach((store) => {
      const [lng, lat] = store.location.coordinates;
      
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current!,
        title: store.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="${selectedStoreId === store._id ? '#0F7BA0' : '#0f2744'}"/>
              <circle cx="20" cy="18" r="12" fill="white"/>
              <path d="M12 14h16v2H12zM14 18h12v6H14z" fill="${selectedStoreId === store._id ? '#0F7BA0' : '#0f2744'}"/>
              <rect x="18" y="20" width="4" height="4" fill="${selectedStoreId === store._id ? '#0F7BA0' : '#0f2744'}"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${store.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${store.address}</p>
            <p style="font-size: 12px; color: ${store.isOpen ? '#22c55e' : '#ef4444'};">
              ${store.isOpen ? 'Open' : 'Closed'}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker);
        setSelectedStoreId(store._id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (displayStores.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      displayStores.forEach((store) => {
        const [lng, lat] = store.location.coordinates;
        bounds.extend({ lat, lng });
      });
      if (userLocation) {
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      }
      googleMapRef.current.fitBounds(bounds);
    }
  }, [displayStores, isMapLoaded, selectedStoreId, userLocation]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await getStores({ search: searchQuery });
    } else if (userLocation) {
      await getNearbyStores(userLocation.lat, userLocation.lng, 10);
    } else {
      await getStores();
    }
  }, [searchQuery, userLocation, getStores, getNearbyStores]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Get current day's hours
  const getTodayHours = (store: Store) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = store.operatingHours.find(h => h.day === today);
    if (!hours || hours.isClosed) return 'Closed Today';
    return `${hours.openTime} - ${hours.closeTime}`;
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating || 0}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left Sidebar - Store List */}
        <div className="w-full lg:w-[450px] bg-white shadow-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-[#0f2744] mb-4">Our Store</h1>
            
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0F7BA0] focus:ring-2 focus:ring-[#0F7BA0]/20"
              />
            </div>

            {/* Location Info */}
            {userLocation?.address && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <FiNavigation className="w-4 h-4 text-[#0F7BA0]" />
                <span className="truncate">{userLocation.address}</span>
              </div>
            )}
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading || isNearbyLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F7BA0]"></div>
              </div>
            ) : displayStores.length === 0 ? (
              <div className="p-6 text-center">
                <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Store not available in this location
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  We couldn&apos;t find any stores near you.
                </p>
                <button
                  onClick={() => getStores()}
                  className="text-[#0F7BA0] font-semibold hover:underline"
                >
                  Check our all stores →
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {displayStores.map((store) => (
                  <Link
                    key={store._id}
                    href={`/stores/${store.slug}`}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      selectedStoreId === store._id ? 'bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => setSelectedStoreId(store._id)}
                  >
                    <div className="flex gap-3">
                      {/* Store Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={store.image || '/Images/Home/service-section/service-1.jpg'}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0f2744] truncate">
                          {store.name}
                        </h3>
                        
                        {/* Rating */}
                        {renderStars(store.rating)}

                        {/* Open/Close Status */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs font-medium ${store.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {store.isOpen ? 'Open' : 'Closed'}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-green-600">
                            Close {getTodayHours(store).split(' - ')[1] || '10:30 pm'}
                          </span>
                        </div>

                        {/* Address */}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {store.address}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Google Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Map Loading Overlay */}
          {!isMapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0F7BA0] mx-auto mb-3"></div>
                <p className="text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoresPage;

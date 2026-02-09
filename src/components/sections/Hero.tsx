'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoChevronDown } from 'react-icons/io5';
import { FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '@/context';
import { useStoreStore, Store } from '@/store/storeStore';

const Hero = () => {
  const { t } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [noStoreFound, setNoStoreFound] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    stores,
    nearbyStores,
    userLocation,
    isLoading,
    isNearbyLoading,
    getStores,
    getNearbyStores,
    getUserLocation,
  } = useStoreStore();

  // Display stores - prefer nearby if available
  const displayStores = nearbyStores.length > 0 ? nearbyStores : stores;

  // Fetch all stores on mount
  useEffect(() => {
    getStores();
  }, [getStores]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    const autoDetectLocation = async () => {
      setIsDetecting(true);
      const success = await getUserLocation();
      
      if (success) {
        const { userLocation: loc } = useStoreStore.getState();
        if (loc) {
          const hasNearbyStores = await getNearbyStores(loc.lat, loc.lng, 10);
          setNoStoreFound(!hasNearbyStores);
          
          // Auto-select first nearby store
          if (hasNearbyStores) {
            const { nearbyStores: nearby } = useStoreStore.getState();
            if (nearby.length > 0) {
              setSelectedStore(nearby[0]);
            }
          }
        }
      }
      setIsDetecting(false);
    };

    autoDetectLocation();
  }, [getUserLocation, getNearbyStores]);

  // Handle store selection
  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setIsOpen(false);
    setNoStoreFound(false);
  };

  // Handle Book Now
  const handleBookNow = () => {
    if (selectedStore) {
      router.push(`/stores/${selectedStore.slug}`);
    } else {
      router.push('/stores');
    }
  };

  // Handle View All Stores
  const handleViewAllStores = () => {
    router.push('/stores');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#f0f4f8]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/Images/Home/Hero.png"
          alt="Laundry Background"
          fill
          className="object-cover "
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-white/35 via-white/10 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-325 mx-auto relative z-10 pt-32 pb-20 px-4 ">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0f2744] mb-6 leading-[1.1] animate-fade-in-up" style={{ fontFamily: 'DM Serif Display, serif' }}>
            {t('heroTitle1')}
            <br />
            {t('heroTitle2')}
          </h1>
          
          <p className="text-[#4a5568] text-lg md:text-xl mb-10 animate-fade-in-up animation-delay-200 max-w-2xl">
            {t('heroSubtitle')}
          </p>

          {/* Location Dropdown & Button */}
          <div className="bg-white p-4 rounded-lg shadow-md max-w-3xl animate-fade-in-up animation-delay-300">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Store Dropdown */}
              <div className="relative flex-1" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  disabled={isDetecting || isLoading}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#0f2744] transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {isDetecting || isNearbyLoading ? (
                      <FiLoader className="w-5 h-5 text-[#0F7BA0] animate-spin" />
                    ) : (
                      <FiMapPin className="w-5 h-5 text-[#0F7BA0]" />
                    )}
                    <span className={selectedStore ? 'text-[#0f2744]' : 'text-[#4a5568]'}>
                      {isDetecting 
                        ? 'Detecting your location...' 
                        : selectedStore 
                          ? selectedStore.name 
                          : t('selectLocation') || 'Select a store location'}
                    </span>
                  </div>
                  <IoChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {/* User Location Info */}
                    {userLocation && (
                      <div className="px-4 py-3 bg-[#f0f9ff] border-b border-gray-100">
                        <p className="text-sm text-[#0F7BA0] flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          {userLocation.address || `Near ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                        </p>
                      </div>
                    )}

                    {/* No Stores Message */}
                    {noStoreFound && (
                      <div className="px-4 py-4 text-center">
                        <FiAlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-[#4a5568] mb-3">No stores available in your area</p>
                        <button
                          onClick={handleViewAllStores}
                          className="text-[#0F7BA0] hover:underline font-medium"
                        >
                          Check all our stores →
                        </button>
                      </div>
                    )}

                    {/* Store List */}
                    {!noStoreFound && displayStores.length > 0 && (
                      <>
                        {nearbyStores.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Nearby Stores</p>
                          </div>
                        )}
                        {displayStores.map((store) => (
                          <button
                            key={store._id}
                            onClick={() => handleSelectStore(store)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                          >
                            <FiMapPin className="w-5 h-5 text-[#0F7BA0] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-[#0f2744]">{store.name}</p>
                              <p className="text-sm text-[#4a5568]">{store.address}</p>
                            </div>
                          </button>
                        ))}
                        
                        {/* View All Stores Link */}
                        <button
                          onClick={handleViewAllStores}
                          className="w-full px-4 py-3 text-center text-[#0F7BA0] hover:bg-gray-50 transition-colors border-t border-gray-100 font-medium"
                        >
                          View all stores →
                        </button>
                      </>
                    )}

                    {/* Loading State */}
                    {isLoading && displayStores.length === 0 && (
                      <div className="px-4 py-6 text-center">
                        <FiLoader className="w-6 h-6 text-[#0F7BA0] animate-spin mx-auto mb-2" />
                        <p className="text-[#4a5568]">Loading stores...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Book Now Button */}
              <button 
                onClick={handleBookNow}
                className="bg-[#0f2744] text-white px-16 py-4 rounded font-semibold transition-all duration-300 hover:bg-[#1a3a5c] hover:shadow-lg hover:-translate-y-0.5"
              >
                {t('bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
     
    </section>
  );
};

export default Hero;

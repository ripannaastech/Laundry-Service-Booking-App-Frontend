'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MdSearch } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { FiLoader, FiMapPin } from 'react-icons/fi';
import { useStoreStore, Store } from '@/store/storeStore';

const ServiceNetwork = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const { stores, isLoading, getStores } = useStoreStore();

  // Fetch stores on mount
  useEffect(() => {
    getStores();
  }, [getStores]);

  // Filter stores based on search query
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if store is currently open
  const isStoreOpen = (store: Store): { isOpen: boolean; closeTime: string } => {
    if (!store.operatingHours || store.operatingHours.length === 0) {
      return { isOpen: store.isOpen ?? true, closeTime: '10:00 PM' };
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()].toLowerCase();
    const todayHours = store.operatingHours.find(h => h.day.toLowerCase() === today);
    
    if (!todayHours || todayHours.isClosed) {
      return { isOpen: false, closeTime: 'Closed' };
    }
    
    return { isOpen: true, closeTime: todayHours.closeTime || '10:00 PM' };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Generate Google Maps embed URL with store markers
  const getMapEmbedUrl = () => {
    if (filteredStores.length > 0 && filteredStores[0].location?.coordinates) {
      const [lng, lat] = filteredStores[0].location.coordinates;
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1637345678901!5m2!1sen!2s`;
    }
    // Default to Dhaka center
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116834.02060713442!2d90.33728791640625!3d23.780753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2s!4v1637345678901!5m2!1sen!2s";
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-14 lg:mb-16">
          <p className="text-[#0F7BA0] font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Coverage Area</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-[#0f2744] mb-3 sm:mb-4 px-4">
            Our Service Network
          </h2>
          <p className="text-[#5a6a7a] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed px-4">
            Delivering excellence across the city. Discover our store locations and enjoy the convenience of professional dry cleaning and laundry services right in your area.
          </p>
        </div>

        <div className="relative h-150 sm:h-162.5 md:h-175 lg:h-187.5 xl:h-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
          {/* Map Background */}
          <div className="absolute inset-0 ">
            <iframe
              src={getMapEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Service Locations Map"
            ></iframe>
          </div>

          {/* Left Sidebar */}
          <div className="absolute top-0 left-0 h-full w-full sm:w-[320px] md:w-[350px] lg:w-[380px] xl:w-[420px] bg-white shadow-xl sm:shadow-2xl z-10 flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0f2744] mb-1">Our Stores</h3>
              
              {/* Search Box */}
              <div className="relative mt-2 sm:mt-3 md:mt-4">
                <input
                  type="text"
                  placeholder="Search by name, city or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-gray-100 rounded-lg text-[#0f2744] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F7BA0] text-xs sm:text-sm"
                />
                <MdSearch className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
              </div>
            </div>

            {/* Store List */}
            <div className="flex-1 overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <FiLoader className="w-8 h-8 text-[#0F7BA0] animate-spin" />
                </div>
              )}

              {/* No Stores Found */}
              {!isLoading && filteredStores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <FiMapPin className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    {searchQuery ? 'No stores found matching your search' : 'No stores available'}
                  </p>
                </div>
              )}

              {/* Store List */}
              {!isLoading && filteredStores.map((store) => {
                const storeStatus = isStoreOpen(store);
                const storeImage = store.images?.[0] || '/Images/Home/location-section/location-1.png';
                
                return (
                  <Link
                    href={`/stores/${store.slug}`}
                    key={store._id}
                    className="block relative group"
                    onMouseEnter={() => setHoveredCard(store._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Left Border on Hover */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-[#0F7BA0] transition-all duration-300 ${
                        hoveredCard === store._id ? 'opacity-100' : 'opacity-0'
                      }`}
                    ></div>

                    <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-gray-50">
                      <div className="flex gap-2 sm:gap-3 md:gap-4">
                        {/* Store Image */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={storeImage}
                            alt={store.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Store Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#0f2744] mb-0.5 sm:mb-1 text-[10px] sm:text-xs md:text-sm truncate">{store.name}</h4>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 md:mb-2">
                            <div className="flex">{renderStars(store.rating || 4.5)}</div>
                            <span className="text-[#0f2744] text-[10px] sm:text-xs font-semibold">{store.rating?.toFixed(1) || '4.5'}</span>
                          </div>

                          {/* Status */}
                          <div className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs mb-1 sm:mb-1.5 ${storeStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="font-semibold">{storeStatus.isOpen ? 'Open' : 'Closed'}</span>
                            {storeStatus.isOpen && (
                              <>
                                <span>•</span>
                                <span className="hidden sm:inline">Closes {storeStatus.closeTime}</span>
                                <span className="sm:hidden">{storeStatus.closeTime}</span>
                              </>
                            )}
                          </div>

                          {/* Address */}
                          <p className="text-gray-600 text-[9px] sm:text-[10px] md:text-xs line-clamp-2">{store.address}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* View All Link */}
              {!isLoading && filteredStores.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <Link 
                    href="/stores" 
                    className="block text-center text-[#0F7BA0] font-semibold hover:underline"
                  >
                    View All Stores →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceNetwork;

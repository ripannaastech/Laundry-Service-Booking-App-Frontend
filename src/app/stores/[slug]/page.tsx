'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiStar, FiMapPin, FiPhone, FiMail, FiClock, FiCheck, FiNavigation } from 'react-icons/fi';
import { useStoreStore } from '@/store/storeStore';

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

const StoreDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    selectedStore,
    isDetailLoading,
    error,
    getStoreBySlug,
    clearSelectedStore,
  } = useStoreStore();

  // Fetch store on mount
  useEffect(() => {
    if (slug) {
      getStoreBySlug(slug);
    }
    return () => clearSelectedStore();
  }, [slug, getStoreBySlug, clearSelectedStore]);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setIsMapLoaded(true);
    });
  }, []);

  // Initialize map when store data is available
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !selectedStore) return;

    const [lng, lat] = selectedStore.location.coordinates;
    
    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
    });

    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: selectedStore.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 0C11 0 0 11 0 25c0 19 25 35 25 35s25-16 25-35C50 11 39 0 25 0z" fill="#0f2744"/>
            <circle cx="25" cy="22" r="14" fill="white"/>
            <path d="M15 17h20v2.5H15zM17.5 22h15v7.5H17.5z" fill="#0f2744"/>
            <rect x="22.5" y="24" width="5" height="5" fill="#0f2744"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(50, 60),
        anchor: new google.maps.Point(25, 60),
      },
    });
  }, [isMapLoaded, selectedStore]);

  // Get day name
  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Check if today
  const isToday = (day: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()] === day;
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-gray-600 ml-2">
          {rating || 0} ({selectedStore?.totalReviews || 0} reviews)
        </span>
      </div>
    );
  };

  if (isDetailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F7BA0] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Store Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The store you are looking for does not exist.'}</p>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 bg-[#0f2744] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a3a5c] transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0F7BA0] transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Stores</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-80 md:h-96">
                <Image
                  src={selectedStore.images[activeImageIndex] || selectedStore.image || '/Images/Home/service-section/service-1.jpg'}
                  alt={selectedStore.name}
                  fill
                  className="object-cover"
                />
                {/* Open/Closed Badge */}
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedStore.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {selectedStore.isOpen ? 'Open Now' : 'Closed'}
                </div>
              </div>
              
              {/* Image Thumbnails */}
              {selectedStore.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {selectedStore.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImageIndex === index ? 'border-[#0F7BA0]' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${selectedStore.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f2744] mb-3">
                {selectedStore.name}
              </h1>
              
              {renderStars(selectedStore.rating)}

              <p className="text-gray-600 mt-4 leading-relaxed">
                {selectedStore.description}
              </p>

              {/* Features */}
              {selectedStore.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#0f2744] mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStore.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F7BA0]/10 text-[#0F7BA0] rounded-full text-sm"
                      >
                        <FiCheck className="w-4 h-4" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#0f2744] mb-4 flex items-center gap-2">
                <FiClock className="w-5 h-5 text-[#0F7BA0]" />
                Operating Hours
              </h3>
              <div className="space-y-2">
                {selectedStore.operatingHours.map((hours) => (
                  <div
                    key={hours.day}
                    className={`flex justify-between py-2 px-3 rounded-lg ${
                      isToday(hours.day) ? 'bg-[#0F7BA0]/10' : ''
                    }`}
                  >
                    <span className={`font-medium ${isToday(hours.day) ? 'text-[#0F7BA0]' : 'text-gray-700'}`}>
                      {getDayName(hours.day)}
                      {isToday(hours.day) && <span className="ml-2 text-xs">(Today)</span>}
                    </span>
                    <span className={hours.isClosed ? 'text-red-500' : 'text-gray-600'}>
                      {hours.isClosed ? 'Closed' : `${hours.openTime} - ${hours.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Map & Contact */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div ref={mapRef} className="w-full h-64" />
              
              {/* Get Directions Button */}
              <div className="p-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.location.coordinates[1]},${selectedStore.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#0f2744] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a5c] transition-colors"
                >
                  <FiNavigation className="w-5 h-5" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#0f2744] mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-[#0F7BA0] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{selectedStore.address}</p>
                    <p className="text-gray-500 text-sm">
                      {selectedStore.area}, {selectedStore.city} - {selectedStore.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-[#0F7BA0] flex-shrink-0" />
                  <a href={`tel:${selectedStore.phone}`} className="text-gray-700 hover:text-[#0F7BA0]">
                    {selectedStore.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-[#0F7BA0] flex-shrink-0" />
                  <a href={`mailto:${selectedStore.email}`} className="text-gray-700 hover:text-[#0F7BA0]">
                    {selectedStore.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Book Now CTA */}
            <div className="bg-gradient-to-r from-[#0f2744] to-[#0F7BA0] rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
              <p className="text-white/80 text-sm mb-4">
                Schedule your laundry pickup from this location
              </p>
              <Link
                href={`/services?store=${selectedStore.slug}`}
                className="block w-full bg-white text-[#0f2744] py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;

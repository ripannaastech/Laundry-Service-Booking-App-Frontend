'use client';

import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { FiMap, FiNavigation } from 'react-icons/fi';

const RoutePage = () => {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FiMap className="w-6 h-6 text-[#148f77]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
            <p className="text-sm text-gray-500">Optimize your delivery route</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="h-[400px] bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center">
            <FiNavigation className="w-16 h-16 text-gray-300 dark:text-gray-500 mb-4" />
            <p className="text-lg font-medium text-gray-400 dark:text-gray-500">Map Integration</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Google Maps / Mapbox will be integrated here</p>
          </div>
        </div>

        {/* Route info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-[#148f77]">0</p>
            <p className="text-sm text-gray-500 mt-1">Stops Today</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-[#148f77]">0 km</p>
            <p className="text-sm text-gray-500 mt-1">Total Distance</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-[#148f77]">0 min</p>
            <p className="text-sm text-gray-500 mt-1">Est. Time</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            🗺️ Route optimization with real-time map will be available once Google Maps API is configured.
          </p>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default RoutePage;

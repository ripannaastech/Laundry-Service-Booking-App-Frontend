'use client';

import { useState, useEffect } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import api from '@/services/api';
import { FiLoader, FiStar, FiMessageSquare } from 'react-icons/fi';

interface Review {
  _id: string;
  user?: { name: string; email: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const StaffReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        if (res.data.status === 'success') setReviews(res.data.data || []);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, []);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16"><FiLoader className="w-8 h-8 text-[#2e86c1] animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffReviewsPage;

import React from 'react';

const RoomCardSkeleton: React.FC = () => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md 
        overflow-hidden animate-pulse"
    >
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-300" />

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />

        {/* Room Number */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />

        {/* Description */}
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Capacity & Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>

        {/* Amenities */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>

        {/* Price & Button */}
        <div 
          className="flex items-center justify-between 
            pt-3 border-t"
        >
          <div>
            <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-7 bg-gray-300 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-10" />
          </div>
          <div className="h-10 bg-gray-300 rounded w-28" />
        </div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;

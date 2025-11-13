import React from 'react';

const BannerSkeleton: React.FC = () => {
  return (
    <div 
      className="w-full h-[400px] md:h-[500px] 
        bg-gray-300 rounded-xl shadow-lg animate-pulse"
    >
      <div className="w-full h-full flex items-end p-8">
        <div className="w-full max-w-xl space-y-3">
          <div className="h-12 bg-gray-400 rounded w-3/4" />
          <div className="h-8 bg-gray-400 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default BannerSkeleton;

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '../../services/api/bannerService';

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  banners 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Default fallback banner if no banners provided
  const defaultBanner = {
    id: 0,
    title: 'Chào mừng đến với Hotel Booking',
    image_url: '/images/default-banner.jpg',
    position: 'home',
    display_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  };

  const displayBanners = banners.length > 0 
    ? banners 
    : [defaultBanner];
  const currentBanner = displayBanners[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] 
      overflow-hidden rounded-xl shadow-lg"
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = '/images/default-banner.jpg';
          }}
        />

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t 
            from-black/60 via-black/20 to-transparent"
        />

        {/* Title */}
        {currentBanner.title && (
          <div 
            className="absolute bottom-8 left-8 right-8 
              text-white"
          >
            <h2 
              className="text-3xl md:text-5xl font-bold 
                mb-2 drop-shadow-lg"
            >
              {currentBanner.title}
            </h2>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {displayBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 
              -translate-y-1/2 bg-white/80 
              hover:bg-white text-gray-800 p-2 
              rounded-full shadow-lg transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 
              -translate-y-1/2 bg-white/80 
              hover:bg-white text-gray-800 p-2 
              rounded-full shadow-lg transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {displayBanners.length > 1 && (
        <div 
          className="absolute bottom-4 left-1/2 
            -translate-x-1/2 flex gap-2"
        >
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full 
                transition-all
                ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;

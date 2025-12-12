import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '../../types/banner';
import { useTranslation } from 'react-i18next';

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  banners 
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derived values and handlers computed before JSX
  const hasBanners = banners.length > 0;
  const displayBanners = banners;
  const currentIndexSafe = hasBanners
    ? Math.min(currentIndex, displayBanners.length - 1)
    : 0;
  const currentBanner = hasBanners
    ? displayBanners[currentIndexSafe]
    : null;

  // Resolve server URL once
  const SERVER_URL = (import.meta.env.VITE_API_URL ||
    'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

  // Resolve image src (absolute if under /uploads)
  let imgSrcResolved = currentBanner
    ? (currentBanner.image_url || '/images/default-banner.jpg')
    : '/images/default-banner.jpg';
  try {
    if (imgSrcResolved.startsWith('/uploads')) {
      imgSrcResolved = `${SERVER_URL}${imgSrcResolved}`;
    }
  } catch (e) {
    imgSrcResolved = '/images/default-banner.jpg';
  }

  // Translate banner title when possible. We keep the original
  // title as fallback if no translation is found.
  const translateTitleKey = currentBanner?.title
    ? `banners_custom.${currentBanner.title}`
    : null;

  let titleText = t('banner.welcome');
  if (currentBanner?.title) {
    const translated = translateTitleKey ? t(translateTitleKey) : '';
    // i18next returns the key when translation missing, so
    // compare and fallback to original title when needed.
    titleText = translated && translated !== translateTitleKey
      ? translated
      : currentBanner.title;
  }
  const altText = titleText;
  const showNav = hasBanners && displayBanners.length > 1;
  const showDots = hasBanners && displayBanners.length > 1;

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!showNav) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === displayBanners.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [displayBanners.length, showNav]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayBanners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === displayBanners.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative w-full h-[500px] md:h-[640px] \
        overflow-hidden rounded-xl shadow-lg"
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        {/* Image */}
        <img
          src={imgSrcResolved}
          alt={altText}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = '/images/default-banner.jpg';
          }}
        />

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t 
            from-black/60 via-black/20 to-transparent"
        />

        {/* Title */}
        {(currentBanner && titleText) && (
          <div 
            className="absolute bottom-8 left-8 right-8 
              text-white"
          >
            <h2 
              className="text-3xl md:text-5xl font-bold 
                mb-2 drop-shadow-lg"
            >
              {titleText}
            </h2>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {showNav && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 
              -translate-y-1/2 bg-white/80 
              hover:bg-white text-gray-800 p-2 
              rounded-full shadow-lg transition-all"
            aria-label={t('banner.previousBanner')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 
              -translate-y-1/2 bg-white/80 
              hover:bg-white text-gray-800 p-2 
              rounded-full shadow-lg transition-all"
            aria-label={t('banner.nextBanner')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && (
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
                  index === currentIndexSafe
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`${t('banner.goToSlide')} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;

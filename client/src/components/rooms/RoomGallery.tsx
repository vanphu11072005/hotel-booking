import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

const RoomGallery: React.FC<RoomGalleryProps> = ({ 
  images, 
  roomName 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : ['/images/room-placeholder.jpg'];

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="grid grid-cols-4 gap-2 h-96">
        {/* Main Image */}
        <div
          className="col-span-4 md:col-span-3 relative 
            overflow-hidden rounded-lg cursor-pointer 
            group"
          onClick={() => openModal(0)}
        >
          <img
            src={safeImages[0]}
            alt={`${roomName} - Main`}
            className="w-full h-full object-cover 
              transition-transform duration-300 
              group-hover:scale-110"
          />
          <div
            className="absolute inset-0 bg-black 
              bg-opacity-0 group-hover:bg-opacity-20 
              transition-all duration-300 
              flex items-center justify-center"
          >
            <span
              className="text-white font-medium 
                opacity-0 group-hover:opacity-100 
                transition-opacity"
            >
              Xem ảnh lớn
            </span>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div
          className="hidden md:flex flex-col gap-2 
            col-span-1"
        >
          {safeImages.slice(1, 4).map((image, index) => (
            <div
              key={index + 1}
              className="relative overflow-hidden 
                rounded-lg cursor-pointer group 
                flex-1"
              onClick={() => openModal(index + 1)}
            >
              <img
                src={image}
                alt={`${roomName} - ${index + 2}`}
                className="w-full h-full object-cover 
                  transition-transform duration-300 
                  group-hover:scale-110"
              />
              {index === 2 && safeImages.length > 4 && (
                <div
                  className="absolute inset-0 bg-black 
                    bg-opacity-60 flex items-center 
                    justify-center"
                >
                  <span className="text-white font-semibold">
                    +{safeImages.length - 4} ảnh
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black 
            bg-opacity-90 flex items-center 
            justify-center"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 
              text-white hover:text-gray-300 
              transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 text-white 
              hover:text-gray-300 transition-colors 
              z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white 
              hover:text-gray-300 transition-colors 
              z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div
            className="max-w-6xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[currentIndex]}
              alt={`${roomName} - ${currentIndex + 1}`}
              className="max-w-full max-h-[90vh] 
                object-contain"
            />
            <div
              className="absolute bottom-4 left-1/2 
                transform -translate-x-1/2 
                bg-black bg-opacity-50 
                text-white px-4 py-2 rounded-full"
            >
              {currentIndex + 1} / {safeImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomGallery;

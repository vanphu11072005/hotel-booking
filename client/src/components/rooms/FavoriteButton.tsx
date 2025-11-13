import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import useFavoritesStore from '../../store/useFavoritesStore';

interface FavoriteButtonProps {
  roomId: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  roomId,
  size = 'md',
  showTooltip = true,
  className = '',
}) => {
  const {
    isFavorited,
    addToFavorites,
    removeFromFavorites,
  } = useFavoritesStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTooltipText, setShowTooltipText] = 
    useState(false);

  const favorited = isFavorited(roomId);

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (favorited) {
        await removeFromFavorites(roomId);
      } else {
        await addToFavorites(roomId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const tooltipText = favorited
    ? 'Bỏ yêu thích'
    : 'Thêm vào yêu thích';

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        onMouseEnter={() => 
          showTooltip && setShowTooltipText(true)
        }
        onMouseLeave={() => setShowTooltipText(false)}
        className={`
          ${sizeClasses[size]}
          rounded-full
          transition-all
          duration-200
          flex
          items-center
          justify-center
          ${
            favorited
              ? 'bg-red-50 hover:bg-red-100'
              : 'bg-white hover:bg-gray-100'
          }
          ${
            isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }
          border-2
          ${
            favorited
              ? 'border-red-500'
              : 'border-gray-300 hover:border-red-500'
          }
          shadow-sm
          hover:shadow-md
          ${className}
        `}
        aria-label={tooltipText}
      >
        <Heart
          size={iconSizes[size]}
          className={`
            transition-all
            duration-200
            ${
              favorited
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400'
            }
            ${isProcessing ? 'animate-pulse' : ''}
          `}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipText && (
        <div
          className="absolute bottom-full left-1/2 
            -translate-x-1/2 mb-2 px-3 py-1 
            bg-gray-900 text-white text-xs 
            rounded-lg whitespace-nowrap 
            pointer-events-none z-50
            animate-fade-in"
        >
          {tooltipText}
          <div
            className="absolute top-full left-1/2 
              -translate-x-1/2 -mt-1 
              border-4 border-transparent 
              border-t-gray-900"
          />
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;

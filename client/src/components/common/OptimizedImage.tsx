import React, { 
  useState, 
  useEffect, 
  ImgHTMLAttributes 
} from 'react';

interface OptimizedImageProps 
  extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setImageSrc(fallbackSrc);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={`relative overflow-hidden 
        bg-gray-200 ${className}`}
      style={
        aspectRatio 
          ? { aspectRatio } 
          : undefined
      }
    >
      {isLoading && (
        <div 
          className="absolute inset-0 
            flex items-center justify-center"
        >
          <div 
            className="w-8 h-8 border-4 
              border-gray-300 border-t-indigo-600 
              rounded-full animate-spin"
          />
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${hasError ? 'opacity-50' : ''}
        `}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;

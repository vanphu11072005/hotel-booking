import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Đang tải...',
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className={`flex flex-col items-center 
      justify-center gap-3 ${className}`}
    >
      <Loader2
        className={`${sizeClasses[size]} 
          text-indigo-600 animate-spin`}
      />
      {text && (
        <p className={`${textSizeClasses[size]} 
          text-gray-600 font-medium`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 
        flex items-center justify-center"
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

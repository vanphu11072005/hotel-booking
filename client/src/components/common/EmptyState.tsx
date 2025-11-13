import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className = '',
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm 
        p-12 text-center ${className}`}
    >
      {Icon && (
        <div 
          className="w-24 h-24 bg-gray-100 
            rounded-full flex items-center 
            justify-center mx-auto mb-6"
        >
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}

      <h3 
        className="text-2xl font-bold 
          text-gray-900 mb-3"
      >
        {title}
      </h3>

      {description && (
        <p 
          className="text-gray-600 mb-6 
            max-w-md mx-auto"
        >
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div 
          className="flex flex-col sm:flex-row 
            gap-3 justify-center mt-6"
        >
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-indigo-600 
                text-white rounded-lg 
                hover:bg-indigo-700 
                transition-colors font-semibold
                inline-flex items-center 
                justify-center gap-2"
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 border 
                border-gray-300 text-gray-700 
                rounded-lg hover:bg-gray-50 
                transition-colors font-semibold
                inline-flex items-center 
                justify-center gap-2"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

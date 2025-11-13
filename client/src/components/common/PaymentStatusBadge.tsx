import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'unpaid' | 'paid' | 'refunded';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800',
          text: 'Đã thanh toán',
        };
      case 'unpaid':
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Chưa thanh toán',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800',
          text: 'Thanh toán thất bại',
        };
      case 'refunded':
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800',
          text: 'Đã hoàn tiền',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800',
          text: status,
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      case 'md':
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 
        rounded-full font-medium 
        ${config.color} ${getSizeClasses()}`}
    >
      {showIcon && (
        <StatusIcon className={getIconSize()} />
      )}
      {config.text}
    </span>
  );
};

export default PaymentStatusBadge;

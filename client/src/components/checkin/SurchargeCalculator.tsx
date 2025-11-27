import React from 'react';
import { DollarSign } from 'lucide-react';

interface SurchargeCalculatorProps {
  surcharges: {
    extra_adults: number;
    extra_children: number;
    early_checkin: boolean;
    late_checkout: boolean;
    extra_bed: number;
  };
  rates: {
    extra_adult: number;
    extra_child: number;
    early_checkin: number;
    late_checkout: number;
    extra_bed: number;
  };
  onChange: (field: string, value: any) => void;
  maxCapacity?: number;
  currentGuests?: number;
}

const SurchargeCalculator: React.FC<SurchargeCalculatorProps> = ({
  surcharges,
  rates,
  onChange,
  maxCapacity,
  currentGuests = 0,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const calculateTotal = () => {
    let total = 0;
    total += surcharges.extra_adults * rates.extra_adult;
    total += surcharges.extra_children * rates.extra_child;
    total += surcharges.early_checkin ? rates.early_checkin : 0;
    total += surcharges.late_checkout ? rates.late_checkout : 0;
    total += surcharges.extra_bed * rates.extra_bed;
    return total;
  };

  const totalPeople = currentGuests + surcharges.extra_adults + surcharges.extra_children;
  const isOverCapacity = maxCapacity ? totalPeople > maxCapacity : false;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-orange-600" />
        <h4 className="text-base font-bold text-gray-900">Phụ phí & Dịch vụ thêm</h4>
      </div>

      {/* Capacity Warning */}
      {maxCapacity && (
        <div className={`mb-4 p-3 rounded-lg ${
          isOverCapacity ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-300'
        }`}>
          <p className="text-sm font-medium">
            <span className="text-gray-700">Số người:</span>{' '}
            <span className={`font-bold ${isOverCapacity ? 'text-red-700' : 'text-blue-700'}`}>
              {totalPeople}/{maxCapacity}
            </span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {currentGuests} khách chính
            {surcharges.extra_adults > 0 && ` + ${surcharges.extra_adults} người lớn thêm`}
            {surcharges.extra_children > 0 && ` + ${surcharges.extra_children} trẻ em`}
          </p>
          {isOverCapacity && (
            <p className="text-xs text-red-600 font-medium mt-1">
              ⚠️ Vượt quá sức chứa phòng!
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Extra Adults */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người lớn thêm
            </label>
            <input
              type="number"
              min="0"
              value={surcharges.extra_adults}
              onChange={(e) => onChange('extra_adults', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">{formatCurrency(rates.extra_adult)}/người</p>
            <p className="text-base font-bold text-orange-600">
              {formatCurrency(surcharges.extra_adults * rates.extra_adult)}
            </p>
          </div>
        </div>

        {/* Extra Children */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trẻ em (dưới 12 tuổi)
            </label>
            <input
              type="number"
              min="0"
              value={surcharges.extra_children}
              onChange={(e) => onChange('extra_children', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">{formatCurrency(rates.extra_child)}/trẻ</p>
            <p className="text-base font-bold text-orange-600">
              {formatCurrency(surcharges.extra_children * rates.extra_child)}
            </p>
          </div>
        </div>

        {/* Extra Bed */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giường phụ
            </label>
            <input
              type="number"
              min="0"
              value={surcharges.extra_bed}
              onChange={(e) => onChange('extra_bed', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">{formatCurrency(rates.extra_bed)}/giường</p>
            <p className="text-base font-bold text-orange-600">
              {formatCurrency(surcharges.extra_bed * rates.extra_bed)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-300 my-3"></div>

        {/* Early Check-in */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={surcharges.early_checkin}
              onChange={(e) => onChange('early_checkin', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Check-in sớm (trước 14:00)</span>
          </label>
          <p className="text-base font-bold text-orange-600">
            {surcharges.early_checkin ? formatCurrency(rates.early_checkin) : '0₫'}
          </p>
        </div>

        {/* Late Check-out */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={surcharges.late_checkout}
              onChange={(e) => onChange('late_checkout', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Check-out muộn (sau 12:00)</span>
          </label>
          <p className="text-base font-bold text-orange-600">
            {surcharges.late_checkout ? formatCurrency(rates.late_checkout) : '0₫'}
          </p>
        </div>

        {/* Total */}
        <div className="border-t-2 border-orange-400 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">Tổng phụ phí:</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(calculateTotal())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurchargeCalculator;

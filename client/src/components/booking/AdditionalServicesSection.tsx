import React from 'react';
import type { Service } from '../../types/service';

type Props = {
  services: Service[];
  selectedServices: Record<number, number>;
  setSelectedServices: (s: Record<number, number>) => void;
  formatPrice: (p: number) => string;
};

const AdditionalServicesSection: React.FC<Props> = ({
  services,
  selectedServices,
  setSelectedServices,
  formatPrice,
}) => {
  if (!services || services.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Dịch vụ bổ sung (tùy chọn)
      </h2>

      <div className="space-y-3">
        <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border \
                border-gray-200 dark:border-gray-600 rounded-lg \
                hover:border-indigo-500 dark:hover:border-indigo-400 \
                transition-colors bg-white dark:bg-gray-800"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-white mt-1">
                    {service.description}
                  </p>
                )}
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                  {formatPrice(service.price)} /{service.unit}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => {
                    const currentQty = selectedServices[service.id] || 0;
                    if (currentQty > 0) {
                      setSelectedServices({
                        ...selectedServices,
                        [service.id]: currentQty - 1,
                      });
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center \
                    rounded-lg border border-gray-300 hover:bg-gray-100 \
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !selectedServices[service.id] ||
                    selectedServices[service.id] === 0
                  }
                >
                  -
                </button>

                <input
                  type="number"
                  min="0"
                  value={selectedServices[service.id] || 0}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setSelectedServices({
                      ...selectedServices,
                      [service.id]: value,
                    });
                  }}
                  className="w-16 text-center px-2 py-1 border \
                    border-gray-300 dark:border-gray-600 rounded-lg \
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white \
                    appearance-none focus:ring-2 focus:ring-indigo-500 \
                    focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    const currentQty = selectedServices[service.id] || 0;
                    setSelectedServices({
                      ...selectedServices,
                      [service.id]: currentQty + 1,
                    });
                  }}
                  className="w-8 h-8 flex items-center justify-center \
                    rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdditionalServicesSection;

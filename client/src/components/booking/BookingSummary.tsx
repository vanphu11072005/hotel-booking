import React from 'react';
import type { Room } from '../../types/rooms';
import type { Service } from '../../types/service';

type Props = {
  room: Room;
  numberOfNights: number;
  selectedRoomTypes: Array<{
    id: string;
    room: Room;
    quantity: number;
    availableCount: number | null;
    loading: boolean;
  }>;
  roomTotalPrice: number;
  services: Service[];
  selectedServices: Record<number, number>;
  servicesTotalPrice: number;
  totalPrice: number;
  paymentMethod: string;
  formatPrice: (price: number) => string;
};

const BookingSummary: React.FC<Props> = ({
  room,
  numberOfNights,
  selectedRoomTypes,
  roomTotalPrice,
  services,
  selectedServices,
  servicesTotalPrice,
  totalPrice,
  paymentMethod,
  formatPrice,
}) => {
  const roomType = room.room_type;
  if (!roomType) return null;

  return (
    <div className="lg:col-span-1">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md 
          p-6 sticky top-8"
      >
        <h2 
          className="text-xl font-bold 
            text-gray-900 dark:text-white mb-4"
        >
          Tóm tắt đặt phòng
        </h2>

        {/* Room Info */}
        <div className="mb-4">
          {(() => {
            const firstImage = room?.room_type?.images && room.room_type.images.length > 0
              ? room.room_type.images[0]
              : undefined;
            if (!firstImage) return null;
            const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
              .replace(/\/api\/?$/i, '')
              .replace(/\/$/, '');
            let src = '';
            if (firstImage.startsWith('http')) src = firstImage;
            else if (firstImage.startsWith('/uploads')) src = `${SERVER_URL}${firstImage}`;
            else if (firstImage.startsWith('/')) src = firstImage;
            else src = `${SERVER_URL}/uploads/room_types/${firstImage}`;
            return (
              <img
                src={src}
                alt={roomType.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            );
          })()}
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {roomType.name}
          </h3>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          {numberOfNights > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-white">
                Số đêm
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {numberOfNights} đêm
              </span>
            </div>
          )}

          {/* Room types breakdown */}
          <div className="space-y-1">
            <p className="text-sm font-medium 
              text-gray-700 dark:text-white"
            >
              Phòng đã chọn
            </p>
            {selectedRoomTypes.map((roomType) => {
              const price = 
                roomType.room.price || roomType.room.room_type?.base_price || 0;
              const subtotal = 
                numberOfNights * price * roomType.quantity;
              return (
                <div
                  key={roomType.id}
                  className="flex justify-between 
                    text-sm text-gray-600 dark:text-white pl-2"
                >
                  <span className="text-gray-700 dark:text-white">
                    {roomType.room.room_type?.name} × 
                    {roomType.quantity}
                  </span>
                  <span className="dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {numberOfNights > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-white">
                Tổng tiền phòng
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(roomTotalPrice)}
              </span>
            </div>
          )}

          {/* Services breakdown */}
          {servicesTotalPrice > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <p className="text-sm font-medium 
                  text-gray-700 dark:text-white mb-2"
                >
                  Dịch vụ bổ sung
                </p>
                {Object.entries(selectedServices)
                  .filter(([_, qty]) => qty > 0)
                  .map(([serviceId, qty]) => {
                    const service = services.find(
                      (s) => s.id === Number(serviceId)
                    );
                    if (!service) return null;
                    return (
                      <div
                        key={serviceId}
                        className="flex justify-between 
                            text-sm text-gray-600 dark:text-white mb-1"
                        >
                          <span className="text-gray-700 dark:text-white">
                            {service.name} × {qty}
                          </span>
                          <span className="text-gray-600 dark:text-white">
                            {formatPrice(
                              service.price * qty
                            )}
                          </span>
                        </div>
                    );
                  })}
              </div>

              <div className="flex justify-between 
                text-sm font-medium pt-1 border-t border-gray-100 dark:border-gray-600"
              >
                <span className="text-gray-700 dark:text-white">
                  Tổng tiền dịch vụ
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatPrice(servicesTotalPrice)}
                </span>
              </div>
            </>
          )}

          <div 
            className="border-t border-gray-200 dark:border-gray-700 pt-2 flex 
              justify-between text-lg 
              font-bold"
          >
            <span className="text-gray-900 dark:text-white">Tổng cộng</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {numberOfNights > 0
                ? formatPrice(totalPrice)
                : '---'}
            </span>
          </div>

          {/* Deposit amount for cash payment */}
          {paymentMethod === 'cash' && numberOfNights > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border 
              border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-2"
            >
              <div className="flex justify-between 
                items-center mb-1"
              >
                <span className="text-sm font-medium 
                  text-orange-900 dark:text-orange-200"
                >
                  Tiền cọc cần thanh toán (20%)
                </span>
                <span className="text-lg font-bold 
                  text-orange-700 dark:text-orange-300"
                >
                  {formatPrice(totalPrice * 0.2)}
                </span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Thanh toán qua chuyển khoản để xác nhận đặt phòng
              </p>
            </div>
          )}
        </div>

        {/* Note */}
        <div 
          className={`border rounded-lg p-3 mt-4 ${
            paymentMethod === 'cash'
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              : paymentMethod === 'vnpay'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}
        >
          {paymentMethod === 'cash' ? (
            <p className="text-xs text-orange-800 dark:text-orange-200">
              🔒 <strong>Bắt buộc:</strong> Thanh toán 20% tiền cọc 
              qua chuyển khoản sau khi đặt phòng. 
              Phần còn lại ({formatPrice(totalPrice * 0.8)}) 
              thanh toán khi nhận phòng.
            </p>
          ) : paymentMethod === 'vnpay' ? (
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💳 <strong>VNPay:</strong> Bạn sẽ được chuyển đến 
              cổng thanh toán VNPay để hoàn tất giao dịch 
              một cách nhanh chóng và an toàn.
            </p>
          ) : (
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              💡 Quét mã QR hoặc chuyển khoản theo thông tin 
              sau khi xác nhận đặt phòng.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;

import React from 'react';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import type { Room } from '../../types/rooms';
import RoomTypeCard from './RoomTypeCard';

// Define the shape of selected room type item needed for filtering
export interface SelectedRoomTypeItem {
  room: Room;
  // other fields are not needed for the modal logic
}

interface RoomTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRoomTypes: Room[];
  selectedRoomTypes: SelectedRoomTypeItem[];
  onSelect: (room: Room) => void;
}

const RoomTypeSelectorModal: React.FC<RoomTypeSelectorModalProps> = ({
  isOpen,
  onClose,
  availableRoomTypes,
  selectedRoomTypes,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-7 h-7" />
                Chọn loại phòng
              </h3>
              <p className="text-indigo-100 text-sm mt-1">
                Chọn thêm loại phòng muốn đặt
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {availableRoomTypes.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải danh sách phòng...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Group available rooms by room_type id and
                // render one representative per type.
                const map = new Map<number, Room>();
                for (const ro of availableRoomTypes) {
                  const typeId = ro.room_type?.id ?? ro.id;
                  if (!map.has(typeId)) map.set(typeId, ro);
                }

                const unique = Array.from(map.values()).filter(rt =>
                  !selectedRoomTypes.some(
                    sel => sel.room.room_type?.id === rt.room_type?.id
                  )
                );

                return unique.map((roomOption) => (
                  <RoomTypeCard
                    key={roomOption.id}
                    room={roomOption}
                    onSelect={() => onSelect(roomOption)}
                    actionLabel="Chọn loại này"
                  />
                ));
              })()}
            </div>
          )}

          {availableRoomTypes.length > 0 &&
            availableRoomTypes.filter(roomOption =>
              !selectedRoomTypes.some(
                rt => rt.room.id === roomOption.id
              )
            ).length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Đã chọn tất cả các phòng có sẵn</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
        </div>
      </div>
    </div>
  );
};

export default RoomTypeSelectorModal;

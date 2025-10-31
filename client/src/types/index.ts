export interface Room {
  id: number;
  room_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  price: number;
  images?: string[];
  description?: string;
  room_type: RoomType;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  capacity: number;
  amenities?: string[];
}

export interface Booking {
  id: number;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 
    'checked_out' | 'cancelled';
  special_requests?: string;
  user: User;
  room: Room;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
}

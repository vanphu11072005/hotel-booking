const bookingRepository = require('../repositories/bookingRepository');

/**
 * Booking Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến booking
 */
class BookingService {
  /**
   * Generate a unique booking number
   */
  generateBookingNumber() {
    const prefix = 'BK';
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${ts}-${rand}`;
  }

  /**
   * Calculate payment amount based on payment method
   */
  calculateDeposit(totalPrice, paymentMethod) {
    // VNPay: pay full amount (100%)
    // Cash: pay deposit only (20%)
    // Bank transfer: pay full amount (100%)
    
    if (paymentMethod === 'vnpay') {
      return {
        requiresDeposit: true,
        depositPercentage: 100,
        depositAmount: totalPrice,
      };
    } else if (paymentMethod === 'cash') {
      return {
        requiresDeposit: true,
        depositPercentage: 20,
        depositAmount: (totalPrice * 20) / 100,
      };
    } else {
      // bank_transfer or other
      return {
        requiresDeposit: false,
        depositPercentage: 0,
        depositAmount: 0,
      };
    }
  }

  /**
   * Validate booking dates
   */
  validateBookingDates(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    console.log('📅 Validating dates:', { checkInDate, checkOutDate, today: today.toISOString() });

    if (checkIn >= checkOut) {
      console.error('❌ Check-out phải sau check-in');
      throw {
        statusCode: 400,
        message: 'Check-out date must be after check-in date',
      };
    }

    // Allow booking from today onwards (not in the past)
    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);
    
    if (checkInDay < today) {
      console.error('❌ Ngày check-in không thể trong quá khứ');
      throw {
        statusCode: 400,
        message: 'Check-in date cannot be in the past',
      };
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    console.log('📝 Tạo booking với data:', bookingData);
    
    const {
      room_id,
      check_in_date,
      check_out_date,
      guest_count,
      guest_info,
      total_price,
      notes,
      payment_method = 'cash',
      services = [],
      room_quantity = 1,
    } = bookingData;

    // Validate required fields
    if (!room_id || !check_in_date || !check_out_date || !total_price) {
      console.error('❌ Thiếu trường bắt buộc:', { room_id, check_in_date, check_out_date, total_price });
      throw {
        statusCode: 400,
        message: 'Missing required booking fields',
      };
    }

    // Validate dates
    this.validateBookingDates(check_in_date, check_out_date);

    console.log('💰 Payment method:', payment_method);
    const transaction = await bookingRepository.beginTransaction();

    try {
      // Check if room exists
      const room = await bookingRepository.findRoomById(room_id);
      if (!room) {
        throw { statusCode: 404, message: 'Room not found' };
      }

      // Check for overlapping bookings
      const overlapping = await bookingRepository.findOverlappingBooking(
        room_id,
        check_in_date,
        check_out_date
      );

      if (overlapping) {
        throw {
          statusCode: 409,
          message: 'Room already booked for the selected dates',
        };
      }

      const { 
        requiresDeposit, 
        depositPercentage, 
        depositAmount 
      } = this.calculateDeposit(total_price, payment_method);

      console.log('💳 Payment calculation:', { requiresDeposit, depositPercentage, depositAmount });
      console.log('🏨 Room quantity:', room_quantity);

      // Calculate price per room
      const pricePerRoom = total_price / room_quantity;
      const depositPerRoom = depositAmount / room_quantity;

      // Create parent booking (first room)
      const bookingNumber = this.generateBookingNumber();
      const parentBooking = await bookingRepository.createBooking(
        {
          booking_number: bookingNumber,
          user_id: userId,
          room_id,
          check_in_date: new Date(check_in_date),
          check_out_date: new Date(check_out_date),
          num_guests: guest_count || 1,
          guest_info: guest_info || null,
          total_price: pricePerRoom,
          deposit_amount: depositPerRoom,
          room_quantity: 1,
          parent_booking_id: null,
          special_requests: notes || null,
          payment_method: payment_method,
          status: 'pending',
          requires_deposit: requiresDeposit,
          deposit_paid: false,
        },
        transaction
      );

      // Create child bookings for additional rooms
      const allBookings = [parentBooking];
      if (room_quantity > 1) {
        for (let i = 1; i < room_quantity; i++) {
          const childBookingNumber = `${bookingNumber}-R${i + 1}`;
          const childBooking = await bookingRepository.createBooking(
            {
              booking_number: childBookingNumber,
              user_id: userId,
              room_id,
              check_in_date: new Date(check_in_date),
              check_out_date: new Date(check_out_date),
              num_guests: guest_count || 1,
              guest_info: guest_info || null,
              total_price: pricePerRoom,
              deposit_amount: depositPerRoom,
              room_quantity: 1,
              parent_booking_id: parentBooking.id,
              special_requests: notes || null,
              payment_method: payment_method,
              status: 'pending',
              requires_deposit: requiresDeposit,
              deposit_paid: false,
            },
            transaction
          );
          allBookings.push(childBooking);
        }
      }

      const booking = parentBooking; // Use parent for payment

      // Create payment record for TOTAL amount (all rooms)
      if (requiresDeposit) {
        // Determine payment method and type
        let paymentMethodToUse = 'bank_transfer';
        let paymentType = 'deposit';
        let paymentNotes = `Deposit payment (${depositPercentage}%) for ${room_quantity} room(s) - booking ${bookingNumber}`;
        
        if (payment_method === 'vnpay') {
          paymentMethodToUse = 'e_wallet';
          paymentType = 'full'; // VNPay pays full amount
          paymentNotes = `Full payment (100%) for ${room_quantity} room(s) via VNPay - booking ${bookingNumber}`;
        } else if (payment_method === 'cash') {
          paymentMethodToUse = 'bank_transfer'; // Cash bookings pay deposit via bank transfer
          paymentType = 'deposit';
          paymentNotes = `Deposit payment (${depositPercentage}%) for ${room_quantity} room(s) - booking ${bookingNumber}`;
        }

        // Payment for TOTAL (all rooms)
        await bookingRepository.createPayment(
          {
            booking_id: booking.id,
            amount: depositAmount, // Total deposit for all rooms
            payment_method: paymentMethodToUse,
            payment_type: paymentType,
            deposit_percentage: depositPercentage,
            payment_status: 'pending',
            notes: paymentNotes,
          },
          transaction
        );
      }

      // Create service usage records
      if (services && services.length > 0) {
        for (const serviceItem of services) {
          const { service_id, quantity } = serviceItem;

          const service = await bookingRepository.findServiceById(
            service_id
          );
          
          if (service && service.is_active) {
            const unitPrice = parseFloat(service.price);
            const totalServicePrice = unitPrice * quantity;

            await bookingRepository.createServiceUsage(
              {
                booking_id: booking.id,
                service_id,
                quantity,
                unit_price: unitPrice,
                total_price: totalServicePrice,
                usage_date: new Date(check_in_date),
              },
              transaction
            );
          }
        }
      }

      await transaction.commit();

      // Fetch complete booking with relations
      const bookingWithDetails = 
        await bookingRepository.findBookingById(booking.id);

      // Include info about child bookings
      if (room_quantity > 1) {
        bookingWithDetails.child_bookings = allBookings.slice(1);
      }

      return {
        booking: bookingWithDetails,
        total_rooms: room_quantity,
        message: requiresDeposit
          ? `Booking created for ${room_quantity} room(s). Please pay ${depositPercentage}% deposit to confirm.`
          : `Booking created successfully for ${room_quantity} room(s).`,
      };
    } catch (error) {
      console.error('❌ Lỗi tạo booking:', error);
      // Only rollback if transaction is still active
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Get bookings for a specific user
   */
  async getMyBookings(userId) {
    return await bookingRepository.findBookingsByUserId(userId);
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id, userId = null) {
    const booking = await bookingRepository.findBookingById(id);

    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    // Check ownership if userId provided
    if (userId && booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    return booking;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id, userId, cancellationData) {
    const { reason, details } = cancellationData;
    const booking = await bookingRepository.findBookingById(id);

    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    if (booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    if (booking.status === 'cancelled') {
      throw { statusCode: 400, message: 'Booking already cancelled' };
    }

    // Update booking
    const updatedBooking = await bookingRepository.updateBooking(booking, {
      status: 'cancelled',
      cancellation_reason: reason || null,
      cancellation_details: details || null,
      cancelled_at: new Date(),
    });

    return updatedBooking;
  }

  /**
   * Check booking by booking number
   */
  async checkBookingByNumber(bookingNumber) {
    const booking = 
      await bookingRepository.findBookingByNumber(bookingNumber);

    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    return booking;
  }

  /**
   * Get all bookings with filters (Admin)
   */
  async getAllBookings(filters) {
    const { page = 1, limit = 10 } = filters;
    const whereClause = bookingRepository.buildWhereClause(filters);
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, bookings } = 
      await bookingRepository.findAllBookings(
        whereClause,
        parseInt(limit),
        offset,
        true
      );

    return {
      bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };
  }

  /**
   * Update booking status (Admin)
   */
  async updateBookingStatus(id, status) {
    const { Room } = require('../databases/models');
    
    const booking = await bookingRepository.findBookingById(id);

    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'checked_in',
      'checked_out',
      'cancelled',
      'completed',
    ];

    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: 'Invalid status' };
    }

    const updatedBooking = await bookingRepository.updateBooking(booking, {
      status,
    });

    // Tự động cập nhật trạng thái phòng khi check-in/check-out
    if (booking.room_id) {
      const room = await Room.findByPk(booking.room_id);
      
      if (room) {
        if (status === 'checked_in') {
          // Check-in → Phòng đang ở
          room.status = 'occupied';
          await room.save();
          console.log(`✅ Phòng ${room.room_number} đã chuyển sang trạng thái: occupied`);
        } else if (status === 'checked_out') {
          // Check-out → Phòng bẩn (cần dọn)
          room.status = 'dirty';
          await room.save();
          console.log(`✅ Phòng ${room.room_number} đã chuyển sang trạng thái: dirty`);
        }
      }
    }

    return updatedBooking;
  }

  /**
   * Create single booking with multiple room types
   * rooms: [{ room_id, quantity }]
   * Creates 1 booking record + N booking_rooms records
   */
  async createMultiRoomTypeBooking(userId, bookingData) {
    console.log('📝 Tạo single booking với nhiều loại phòng:', bookingData);
    
    const {
      rooms, // [{ room_id, quantity }]
      check_in_date,
      check_out_date,
      guest_count,
      guest_info,
      total_price,
      notes,
      payment_method = 'cash',
      services = [],
    } = bookingData;

    // Validate required fields
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      throw {
        statusCode: 400,
        message: 'Rooms array is required',
      };
    }

    if (!check_in_date || !check_out_date || !total_price) {
      throw {
        statusCode: 400,
        message: 'Missing required booking fields',
      };
    }

    // Validate dates
    this.validateBookingDates(check_in_date, check_out_date);

    const transaction = await bookingRepository.beginTransaction();

    try {
      const { 
        requiresDeposit, 
        depositPercentage, 
        depositAmount 
      } = this.calculateDeposit(total_price, payment_method);

      console.log('💳 Payment calc:', { 
        requiresDeposit, 
        depositPercentage, 
        depositAmount 
      });

      // Calculate total rooms
      let totalRoomCount = 0;
      for (const roomItem of rooms) {
        totalRoomCount += roomItem.quantity;
      }

      console.log(`🛏️ Total rooms requested: ${totalRoomCount}`);

      // Validate and collect room allocations
      const roomAllocations = []; // [{room_id, quantity, allocated_rooms: [{id, room_number}]}]
      
      for (const roomItem of rooms) {
        const { room_id, quantity } = roomItem;

        // Validate room exists
        const room = await bookingRepository.findRoomById(room_id);
        if (!room) {
          throw { 
            statusCode: 404, 
            message: `Room ${room_id} not found` 
          };
        }

        // Check availability
        const roomService = require('./roomService');
        const availableCount = await roomService.getAvailableRoomCount(
          room_id,
          check_in_date,
          check_out_date
        );

        console.log(`🏨 ${room.room_type?.name || 'Room'} (${room.room_number}):`, {
          requested: quantity,
          available: availableCount
        });

        if (availableCount < quantity) {
          throw {
            statusCode: 409,
            message: `Only ${availableCount} room(s) available for ${room.room_type?.name || 'this type'}. You requested ${quantity}.`,
          };
        }

        // Get specific available rooms
        const availableRooms = await roomService.getAvailableRoomsForType(
          room_id,
          check_in_date,
          check_out_date,
          quantity
        );

        if (availableRooms.length < quantity) {
          throw {
            statusCode: 409,
            message: `Could not allocate ${quantity} room(s).`,
          };
        }

        roomAllocations.push({
          room_type_id: room.room_type_id,
          room_type_name: room.room_type?.name,
          quantity,
          allocated_rooms: availableRooms
        });
      }

      // Create single booking record
      const bookingNumber = this.generateBookingNumber();
      const booking = await bookingRepository.createBooking(
        {
          booking_number: bookingNumber,
          user_id: userId,
          room_id: rooms[0].room_id, // Keep first room for compatibility
          check_in_date: new Date(check_in_date),
          check_out_date: new Date(check_out_date),
          num_guests: guest_count || 1,
          guest_info: guest_info || null,
          total_price: total_price,
          deposit_amount: depositAmount,
          room_quantity: totalRoomCount,
          parent_booking_id: null,
          special_requests: notes || null,
          payment_method: payment_method,
          status: 'pending',
          requires_deposit: requiresDeposit,
          deposit_paid: false,
        },
        transaction
      );

      console.log(`✅ Created booking ${bookingNumber} (ID: ${booking.id})`);

      // Create booking_rooms entries for all allocated rooms
      const { BookingRoom } = require('../databases/models');
      for (const allocation of roomAllocations) {
        for (const allocatedRoom of allocation.allocated_rooms) {
          await BookingRoom.create(
            {
              booking_id: booking.id,
              room_id: allocatedRoom.id,
              quantity: 1 // Each physical room = 1
            },
            { transaction }
          );
          console.log(`📌 Linked room ${allocatedRoom.room_number} to booking`);
        }
      }

      // Create payment record
      if (requiresDeposit) {
        let paymentMethodToUse = 'bank_transfer';
        let paymentType = 'deposit';
        let paymentNotes = `Deposit payment (${depositPercentage}%) for ${totalRoomCount} room(s) - booking ${bookingNumber}`;
        
        if (payment_method === 'vnpay') {
          paymentMethodToUse = 'e_wallet';
          paymentType = 'full';
          paymentNotes = `Full payment (100%) for ${totalRoomCount} room(s) via VNPay - booking ${bookingNumber}`;
        } else if (payment_method === 'cash') {
          paymentMethodToUse = 'bank_transfer';
          paymentType = 'deposit';
          paymentNotes = `Deposit payment (${depositPercentage}%) for ${totalRoomCount} room(s) - booking ${bookingNumber}`;
        }

        await bookingRepository.createPayment(
          {
            booking_id: booking.id,
            amount: depositAmount,
            payment_method: paymentMethodToUse,
            payment_type: paymentType,
            deposit_percentage: depositPercentage,
            payment_status: 'pending',
            notes: paymentNotes,
          },
          transaction
        );
      }

      // Create service usage records
      if (services && services.length > 0) {
        for (const serviceItem of services) {
          const { service_id, quantity } = serviceItem;

          const service = await bookingRepository.findServiceById(
            service_id
          );
          
          if (service && service.is_active) {
            const unitPrice = parseFloat(service.price);
            const totalServicePrice = unitPrice * quantity;

            await bookingRepository.createServiceUsage(
              {
                booking_id: booking.id,
                service_id,
                quantity,
                unit_price: unitPrice,
                total_price: totalServicePrice,
              },
              transaction
            );
          }
        }
      }

      await transaction.commit();

      console.log('✅ Single booking created with multiple rooms:', {
        bookingId: booking.id,
        bookingNumber: bookingNumber,
        totalRoomCount,
        roomTypes: roomAllocations.length
      });

      // Fetch complete booking with relations
      const bookingWithDetails = await bookingRepository.findBookingById(booking.id);

      return {
        booking: bookingWithDetails,
        message: `Booking created successfully for ${totalRoomCount} room(s)`,
      };
    } catch (error) {
      // Only rollback if transaction is still active
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error('❌ Multi-room-type booking error:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new BookingService();

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
   * Calculate deposit amount and percentage
   */
  calculateDeposit(totalPrice, paymentMethod) {
    const requiresDeposit = paymentMethod === 'cash';
    const depositPercentage = requiresDeposit ? 20 : 0;
    const depositAmount = requiresDeposit 
      ? (totalPrice * depositPercentage) / 100 
      : 0;

    return { requiresDeposit, depositPercentage, depositAmount };
  }

  /**
   * Validate booking dates
   */
  validateBookingDates(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn >= checkOut) {
      throw {
        statusCode: 400,
        message: 'Check-out date must be after check-in date',
      };
    }

    if (checkIn < now) {
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
    const {
      room_id,
      check_in_date,
      check_out_date,
      guest_count,
      total_price,
      notes,
      payment_method = 'cash',
      services = [],
    } = bookingData;

    // Validate required fields
    if (!room_id || !check_in_date || !check_out_date || !total_price) {
      throw {
        statusCode: 400,
        message: 'Missing required booking fields',
      };
    }

    // Validate dates
    this.validateBookingDates(check_in_date, check_out_date);

    const transaction = await bookingRepository.beginTransaction();

    try {
      // Check if room exists
      const room = await bookingRepository.findRoomById(room_id);
      if (!room) {
        await transaction.rollback();
        throw { statusCode: 404, message: 'Room not found' };
      }

      // Check for overlapping bookings
      const overlapping = await bookingRepository.findOverlappingBooking(
        room_id,
        check_in_date,
        check_out_date
      );

      if (overlapping) {
        await transaction.rollback();
        throw {
          statusCode: 409,
          message: 'Room already booked for the selected dates',
        };
      }

      const bookingNumber = this.generateBookingNumber();
      const { 
        requiresDeposit, 
        depositPercentage, 
        depositAmount 
      } = this.calculateDeposit(total_price, payment_method);

      // Create booking
      const booking = await bookingRepository.createBooking(
        {
          booking_number: bookingNumber,
          user_id: userId,
          room_id,
          check_in_date: new Date(check_in_date),
          check_out_date: new Date(check_out_date),
          num_guests: guest_count || 1,
          total_price,
          special_requests: notes || null,
          status: 'pending',
          requires_deposit: requiresDeposit,
          deposit_paid: false,
        },
        transaction
      );

      // Create deposit payment record if required
      if (requiresDeposit) {
        await bookingRepository.createPayment(
          {
            booking_id: booking.id,
            amount: depositAmount,
            payment_method: 'bank_transfer',
            payment_type: 'deposit',
            deposit_percentage: depositPercentage,
            payment_status: 'pending',
            notes: `Deposit payment (${depositPercentage}%) for booking ${bookingNumber}`,
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

      return {
        booking: bookingWithDetails,
        message: requiresDeposit
          ? `Booking created. Please pay ${depositPercentage}% deposit to confirm.`
          : 'Booking created successfully',
      };
    } catch (error) {
      await transaction.rollback();
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

    return updatedBooking;
  }
}

// Export singleton instance
module.exports = new BookingService();

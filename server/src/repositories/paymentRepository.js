const { 
  Payment, 
  Booking, 
  Room, 
  RoomType, 
  User,
  Service,
  ServiceUsage 
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Payment Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến payment
 */
class PaymentRepository {
  /**
   * Find payment by ID with booking
   */
  async findPaymentById(paymentId) {
    return await Payment.findByPk(paymentId, {
      include: [{ model: Booking, as: 'booking' }],
    });
  }

  /**
   * Find booking by ID with payments and services
   */
  async findBookingWithPayments(bookingId) {
    return await Booking.findByPk(bookingId, {
      include: [
        { model: Payment, as: 'payments' },
        {
          model: ServiceUsage,
          as: 'service_usages',
          include: [{ model: Service, as: 'service' }],
        },
      ],
    });
  }

  /**
   * Update payment
   */
  async updatePayment(payment, updateData) {
    return await payment.update(updateData);
  }

  /**
   * Update booking
   */
  async updateBooking(booking, updateData) {
    return await booking.update(updateData);
  }

  /**
   * Find all payments with filters
   */
  async findAllPayments(whereClause, limit, offset) {
    const { rows, count } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { 
              model: Room, 
              as: 'room', 
              include: [{ model: RoomType, as: 'room_type' }] 
            },
            { model: User, as: 'user' },
          ],
        },
      ],
      order: [['payment_date', 'DESC']],
      offset,
      limit,
    });

    return { payments: rows, count };
  }

  /**
   * Build where clause for payment filters
   */
  buildWhereClause(filters) {
    const { search, method, from, to, payment_status } = filters;
    const where = {};

    if (search) {
      where['$booking.booking_number$'] = { [Op.like]: `%${search}%` };
    }

    if (method) {
      where.payment_method = method;
    }

    if (from && to) {
      where.payment_date = { 
        [Op.between]: [new Date(from), new Date(to)] 
      };
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    return where;
  }
}

// Export singleton instance
module.exports = new PaymentRepository();

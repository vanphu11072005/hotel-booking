const paymentRepository = require('../repositories/paymentRepository');
const vnpayService = require('../utils/vnpayService');

/**
 * Payment Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến payment
 */
class PaymentService {
  /**
   * Get payment details for a booking
   */
  async getPaymentByBookingId(bookingId, userId) {
    const booking = await paymentRepository.findBookingWithPayments(
      bookingId
    );

    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    if (booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    return {
      payments: booking.payments,
      service_usages: booking.service_usages,
    };
  }

  /**
   * Confirm deposit payment
   */
  async confirmDepositPayment(userId, paymentData) {
    const { payment_id, transaction_id } = paymentData;

    if (!payment_id) {
      throw { statusCode: 400, message: 'Missing payment_id' };
    }

    const payment = await paymentRepository.findPaymentById(payment_id);

    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    const booking = payment.booking;
    if (!booking || booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    // Update payment
    const updatedPayment = await paymentRepository.updatePayment(payment, {
      transaction_id: transaction_id || payment.transaction_id,
      payment_status: 'completed',
      payment_date: new Date(),
    });

    // Mark booking deposit as paid
    const updatedBooking = await paymentRepository.updateBooking(booking, {
      deposit_paid: true,
    });

    return { payment: updatedPayment, booking: updatedBooking };
  }

  /**
   * Get bank transfer info for a pending deposit payment
   */
  async getBankTransferInfo(paymentId, userId) {
    const payment = await paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    if (!payment.booking || payment.booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    const content = `DEP:${payment.booking.booking_number}:${payment.id}`;
    const amount = parseFloat(payment.amount);

    const bankInfo = {
      bank_name: process.env.BANK_NAME || 'Example Bank',
      bank_code: process.env.BANK_CODE || 'EXB',
      account_number: process.env.BANK_ACCOUNT || '0123456789',
      account_name: process.env.BANK_ACCOUNT_NAME || 'Hotel Booking',
      amount,
      content,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        content
      )}`,
    };

    return { payment, bank_info: bankInfo };
  }

  /**
   * Notify payment - mark as pending for manual verification
   */
  async notifyPayment(userId, notificationData) {
    const { payment_id, notes } = notificationData;

    if (!payment_id) {
      throw { statusCode: 400, message: 'Missing payment_id' };
    }

    const payment = await paymentRepository.findPaymentById(payment_id);

    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    if (!payment.booking || payment.booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await paymentRepository.updatePayment(payment, {
      notes: notes || payment.notes,
      payment_status: 'pending',
    });
  }

  /**
   * Extract IPv4 address from request
   */
  extractIPAddress(req) {
    let ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Extract IPv4 address
    if (ipAddr.includes(':')) {
      ipAddr = ipAddr.split(':').pop();
    }

    // Validate IPv4 format
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ipAddr)) {
      ipAddr = '127.0.0.1';
    }

    return ipAddr;
  }

  /**
   * Create VNPay payment URL
   */
  async createVNPayPayment(userId, paymentData, req) {
    const { payment_id, return_url } = paymentData;

    if (!payment_id) {
      throw { statusCode: 400, message: 'Missing payment_id' };
    }

    const payment = await paymentRepository.findPaymentById(payment_id);

    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    if (!payment.booking || payment.booking.user_id !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (payment.payment_status === 'completed') {
      throw { statusCode: 400, message: 'Payment already completed' };
    }

    // Get client IP
    const ipAddr = this.extractIPAddress(req);

    // Create VNPay payment URL
    const orderId = `${payment.id}${Date.now()}`;
    const orderInfo = `Deposit payment for booking ${payment.booking.booking_number}`;
    const amount = parseFloat(payment.amount);

    if (isNaN(amount) || amount <= 0) {
      throw { statusCode: 400, message: 'Invalid payment amount' };
    }

    const paymentUrl = vnpayService.createPaymentUrl({
      amount: amount,
      orderInfo: orderInfo,
      orderId: orderId,
      ipAddr: ipAddr,
      returnUrl: return_url || process.env.VNP_RETURN_URL,
    });

    console.log('VNPay Payment URL created:', paymentUrl);

    return {
      payment_url: paymentUrl,
      payment_id: payment.id,
    };
  }

  /**
   * Handle VNPay return callback
   */
  async handleVNPayReturn(vnpParams) {
    // Verify signature
    const verifyResult = vnpayService.verifyReturn(vnpParams);

    if (!verifyResult.isValid) {
      throw { statusCode: 400, message: 'Invalid signature' };
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = vnpParams;

    // Extract payment_id from orderId
    const paymentId = vnp_TxnRef.replace(/\d{13}$/, ''); // Remove timestamp

    const payment = await paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    // Check response code (00 = success)
    if (vnp_ResponseCode === '00') {
      // Payment successful
      const updatedPayment = await paymentRepository.updatePayment(payment, {
        payment_status: 'completed',
        payment_date: new Date(),
        transaction_id: vnp_TransactionNo,
        payment_method: 'vnpay',
      });

      // Mark booking deposit as paid
      if (payment.booking) {
        await paymentRepository.updateBooking(payment.booking, {
          deposit_paid: true,
        });
      }

      return {
        success: true,
        message: 'Payment successful',
        payment: updatedPayment,
        booking: payment.booking,
      };
    } else {
      // Payment failed
      await paymentRepository.updatePayment(payment, {
        payment_status: 'failed',
        notes: `VNPay error: ${vnp_ResponseCode}`,
      });

      throw {
        statusCode: 400,
        message: 'Payment failed',
        code: vnp_ResponseCode,
        payment,
      };
    }
  }

  /**
   * Get all payments with filters (Admin)
   */
  async getAllPayments(filters) {
    const { page = 1, limit = 5 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = paymentRepository.buildWhereClause(filters);

    const { payments, count } = await paymentRepository.findAllPayments(
      whereClause,
      parseInt(limit),
      offset
    );

    return {
      payments,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    };
  }
}

// Export singleton instance
module.exports = new PaymentService();

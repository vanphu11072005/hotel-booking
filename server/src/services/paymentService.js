const paymentRepository = require('../repositories/paymentRepository');
const vnpayService = require('../utils/vnpayService');
const { URL } = require('url');
const https = require('https');
const http = require('http');

/**
 * Fetch page text from a URL with a timeout (ms)
 */
function fetchUrlText(targetUrl, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(targetUrl);
      const lib = urlObj.protocol === 'https:' ? https : http;
      const req = lib.get(targetUrl, { timeout }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('timeout'));
      });
    } catch (err) {
      reject(err);
    }
  });
}
const { sendEmail } = require('../utils/mailer');
const { 
  bookingConfirmationEmail, 
  bookingConfirmationText 
} = require('../utils/emailTemplates');

/**
 * Payment Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến payment
 */
class PaymentService {
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(booking) {
    try {
      // Parse guest_info if it's a string and normalize
      let guestInfo = booking.guest_info;
      if (typeof guestInfo === 'string') {
        try {
          guestInfo = JSON.parse(guestInfo);
        } catch (e) {
          console.error('Error parsing guest_info:', e);
          guestInfo = null; // continue and try fallback
        }
      }

      // Resolve recipient email (guest_info.email || booking.user.email)
      const userEmail = booking.user?.email;
      const userFullName = booking.user?.full_name;
      let recipientEmail = guestInfo?.email || userEmail;
      if (!guestInfo && userEmail) {
        console.log('ℹ️ Falling back to booking.user.email for booking:', booking.booking_number);
      }

      if (!recipientEmail) {
        console.warn('No email found in guest_info or user for booking:', booking.booking_number);
        return;
      }

      // Get payment info
      const payment = booking.payments?.[0];
      const isFullPayment = payment?.payment_type === 'full';
      const paymentMethod = payment?.payment_method || 'cash';

      // Prepare email data
      const guestNameFromInfo = guestInfo ? (guestInfo.full_name || guestInfo.name || guestInfo.fullName) : null;
      const emailData = {
        booking_number: booking.booking_number,
        guest_name: guestNameFromInfo || userFullName || 'Khách hàng',
        room_name: booking.room?.room_type?.name || 'Chưa xác định',
        room_number: booking.room?.room_number || 'Chưa xác định',
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        payment_method: paymentMethod,
        deposit_amount: booking.deposit_amount || 0,
        requires_deposit: booking.requires_deposit && !isFullPayment,
        is_full_payment: isFullPayment
      };

      // Send email (non-blocking)
      sendEmail({
        to: recipientEmail,
        subject: `Xác nhận đặt phòng ${booking.booking_number}`,
        html: bookingConfirmationEmail(emailData),
        text: bookingConfirmationText(emailData)
      }).catch(err => console.error('Failed to send booking confirmation email:', err));

      console.log('✅ Đã gửi email xác nhận đến:', recipientEmail);
    } catch (error) {
      // Log error but don't throw - email failure shouldn't block booking
      console.error('❌ Lỗi gửi email xác nhận:', error.message);
    }
  }

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
    const wasAlreadyCompleted = payment.payment_status === 'completed';
    const updatedPayment = await paymentRepository.updatePayment(payment, {
      transaction_id: transaction_id || payment.transaction_id,
      payment_status: 'completed',
      payment_date: new Date(),
    });

    // Mark booking deposit as paid
    const updatedBooking = await paymentRepository.updateBooking(booking, {
      deposit_paid: true,
    });

    // Also update child bookings if this is a parent booking
    const { Booking } = require('../databases/models');
    const childBookings = await Booking.findAll({
      where: { parent_booking_id: booking.id }
    });
    
    if (childBookings.length > 0) {
      console.log(`✅ Updating ${childBookings.length} child bookings`);
      await Promise.all(
        childBookings.map(child => 
          paymentRepository.updateBooking(child, { deposit_paid: true })
        )
      );
    }

    // Fetch full booking with relations for email
    const bookingWithDetails = await paymentRepository.findBookingWithPayments(
      booking.id
    );

    // Send confirmation email only if this payment was not already completed
    if (!wasAlreadyCompleted) {
      await this.sendBookingConfirmationEmail(bookingWithDetails);
    } else {
      console.log('ℹ️ Payment already completed previously; skipping duplicate confirmation email');
    }

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
    try {
      const pageHtml = await fetchUrlText(paymentUrl, 5000);
      const errorSignatures = [
        'Payment/Error.html',
        'Không tìm thấy website',
        'Không tìm thấy',
        'timer is not defined',
      ];

      const foundError = errorSignatures.some((s) =>
        pageHtml && pageHtml.includes(s)
      );

      if (foundError) {
        const configuredTmn = process.env.VNP_TMN_CODE ||
          (vnpayService.vnpay && (vnpayService.vnpay.options?.tmnCode || vnpayService.vnpay.options?.TmnCode));

        console.error('VNPay returned an error page. Aborting redirect.', {
          tmn: configuredTmn,
          paymentUrl,
        });

        throw {
          statusCode: 502,
          message:
            'VNPay sandbox returned an error page (Payment/Error). Check TMN code and return URL configuration in VNPay dashboard.',
        };
      }
    } catch (err) {
      if (err && err.statusCode) {
        throw err;
      }

      console.warn('Warning: could not pre-check VNPay payment URL:', err.message || err);
    }

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
      console.error('❌ Xác thực chữ ký VNPay thất bại');
      throw { statusCode: 400, message: 'Chữ ký không hợp lệ' };
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = vnpParams;

    // Extract payment_id from orderId (remove timestamp)
    const paymentId = vnp_TxnRef.replace(/\d{13}$/, '');

    const payment = await paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      console.error('❌ Không tìm thấy payment:', paymentId);
      throw { statusCode: 404, message: 'Không tìm thấy thanh toán' };
    }

    // Check response code (00 = success)
    if (vnp_ResponseCode === '00') {
      // Payment successful
      const wasAlreadyCompleted = payment.payment_status === 'completed';
      const updatedPayment = await paymentRepository.updatePayment(payment, {
        payment_status: 'completed',
        payment_date: new Date(),
        transaction_id: vnp_TransactionNo,
        payment_method: 'e_wallet',
      });

      // Update booking - confirm booking when payment via VNPay is successful
      if (payment.booking) {
        const updateData = {
          deposit_paid: true,
          status: 'confirmed', // Always confirm booking when VNPay payment succeeds
        };
        
        const updatedBooking = await paymentRepository.updateBooking(
          payment.booking, 
          updateData
        );

        // Also update child bookings
        const { Booking } = require('../databases/models');
        const childBookings = await Booking.findAll({
          where: { parent_booking_id: payment.booking.id }
        });
        
        if (childBookings.length > 0) {
          await Promise.all(
            childBookings.map(child => 
              paymentRepository.updateBooking(child, updateData)
            )
          );
        }

        // Fetch full booking with relations for email
        const bookingWithDetails = await paymentRepository.findBookingWithPayments(
          payment.booking.id
        );

        // Send confirmation email only if this payment was not already completed
        if (!wasAlreadyCompleted) {
          await this.sendBookingConfirmationEmail(bookingWithDetails);
        }
      }

      return {
        success: true,
        message: 'Thanh toán thành công',
        payment: updatedPayment,
        booking: payment.booking,
      };
    } else {
      // Payment failed or cancelled
      const updatedPayment = await paymentRepository.updatePayment(payment, {
        payment_status: 'failed',
        notes: `Lỗi VNPay: ${vnp_ResponseCode}`,
      });

      // Cancel booking if payment failed
      let updatedBooking = payment.booking;
      if (payment.booking && payment.booking.status === 'pending') {
        updatedBooking = await paymentRepository.updateBooking(payment.booking, {
          status: 'cancelled',
          cancellation_reason: 'payment_failed',
          cancellation_details: `Thanh toán VNPay bị hủy hoặc thất bại với mã: ${vnp_ResponseCode}`,
          cancelled_at: new Date(),
        });
      }

      throw {
        statusCode: 400,
        message: 'Thanh toán thất bại hoặc bị hủy',
        code: vnp_ResponseCode,
        payment: updatedPayment,
        booking: updatedBooking,
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

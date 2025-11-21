const { VNPay, ignoreLogger } = require('vnpay');

// Khởi tạo VNPay instance
const vnpay = new VNPay({
  // Cấu hình bắt buộc
  tmnCode: process.env.VNP_TMN_CODE || '2QXUI4B4',
  secureSecret: process.env.VNP_HASH_SECRET || 'your-secret-key',
  vnpayHost: 'https://sandbox.vnpayment.vn',

  // Cấu hình tùy chọn
  testMode: true, // Chế độ sandbox
  hashAlgorithm: 'SHA512',
  enableLog: true,
  loggerFn: ignoreLogger,
});

/**
 * Tạo URL thanh toán VNPay
 */
const createPaymentUrl = ({ amount, orderInfo, orderId, ipAddr, returnUrl }) => {
  try {
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount, // Số tiền (VND)
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderId, // Mã đơn hàng
      vnp_OrderInfo: orderInfo, // Thông tin đơn hàng
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl || process.env.VNP_RETURN_URL,
      vnp_Locale: 'vn', // Ngôn ngữ (vn/en)
    });

    return paymentUrl;
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw error;
  }
};

/**
 * Xác thực callback từ VNPay
 */
const verifyReturn = (query) => {
  try {
    console.log('=== Xác thực VNPay Return ===');
    console.log('Tham số query:', query);
    
    const verify = vnpay.verifyReturnUrl(query);
    
    console.log('Kết quả xác thực:', {
      isSuccess: verify.isSuccess,
      isVerified: verify.isVerified,
      message: verify.message
    });
    
    return {
      isValid: verify.isVerified, // Dùng isVerified thay vì isSuccess
      isVerified: verify.isVerified,
      message: verify.message,
      data: query,
    };
  } catch (error) {
    console.error('❌ Lỗi xác thực VNPay return URL:', error);
    throw error;
  }
};

/**
 * Query thông tin giao dịch
 */
const queryTransaction = async ({
  transactionNo,
  txnRef,
  transDate,
  orderId,
  ipAddr,
}) => {
  try {
    const result = await vnpay.queryDr({
      vnp_TransactionNo: transactionNo,
      vnp_TxnRef: txnRef,
      vnp_TransDate: transDate,
      vnp_OrderInfo: orderId,
      vnp_IpAddr: ipAddr,
    });
    return result;
  } catch (error) {
    console.error('Error querying VNPay transaction:', error);
    throw error;
  }
};

/**
 * Hoàn tiền giao dịch
 */
const refundTransaction = async ({
  transactionNo,
  amount,
  txnRef,
  transDate,
  createBy,
  ipAddr,
}) => {
  try {
    const result = await vnpay.refund({
      vnp_Amount: amount,
      vnp_TransactionNo: transactionNo,
      vnp_TxnRef: txnRef,
      vnp_TransDate: transDate,
      vnp_TransactionType: '02', // 02: Hoàn trả toàn phần, 03: Hoàn trả một phần
      vnp_CreateBy: createBy,
      vnp_IpAddr: ipAddr,
    });
    return result;
  } catch (error) {
    console.error('Error refunding VNPay transaction:', error);
    throw error;
  }
};

module.exports = {
  vnpay,
  createPaymentUrl,
  verifyReturn,
  queryTransaction,
  refundTransaction,
};

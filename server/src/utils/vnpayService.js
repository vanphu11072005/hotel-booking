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
    // Resolve TMN code: prefer explicit env var, then library options
    const tmnFromEnv = process.env.VNP_TMN_CODE;
    const configuredTmn = tmnFromEnv || (
      vnpay.options && (vnpay.options.tmnCode || vnpay.options.TmnCode)
    );

    if (!configuredTmn) {
      console.error(
        'VNPay TMN code is not configured. Please set VNP_TMN_CODE in .env'
      );
      throw new Error(
        'VNPay TMN code not configured. Set VNP_TMN_CODE in .env or in vnpay options'
      );
    }

    const resolvedReturnUrl = returnUrl || process.env.VNP_RETURN_URL;
    console.log('VNPay createPaymentUrl called with:', {
      tmnCode: configuredTmn,
      orderId,
      amount,
      resolvedReturnUrl,
    });

    // Amount should be an integer in VND (round if needed)
    const vnpAmount = Math.round(Number(amount) || 0);

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: vnpAmount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: resolvedReturnUrl,
      vnp_Locale: 'vn',
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
    const verify = vnpay.verifyReturnUrl(query);
    
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

const crypto = require('crypto');
const querystring = require('querystring');

// Helper function to format date as yyyyMMddHHmmss
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// VNPay configuration
const vnpayConfig = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET',
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/vnpay-return',
};

/**
 * Sort object by keys
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

/**
 * Create HMAC SHA512 signature
 */
function createSignature(data, secretKey) {
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
  return signed;
}

/**
 * Create VNPay payment URL
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in VND
 * @param {string} params.orderInfo - Order description
 * @param {string} params.orderId - Order ID (booking number)
 * @param {string} params.ipAddr - Client IP address
 * @param {string} params.returnUrl - Custom return URL (optional)
 * @returns {string} Payment URL
 */
function createPaymentUrl(params) {
  const {
    amount,
    orderInfo,
    orderId,
    ipAddr,
    returnUrl,
  } = params;

  const createDate = formatDate(new Date());
  const expireDate = formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

  let vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: String(orderInfo),
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount * 100), // VNPay expects amount as integer in smallest unit (xu)
    vnp_ReturnUrl: returnUrl || vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: String(ipAddr),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  vnpParams = sortObject(vnpParams);

  const signData = querystring.stringify(vnpParams, { encode: false });
  const secureHash = createSignature(signData, vnpayConfig.vnp_HashSecret);
  vnpParams.vnp_SecureHash = secureHash;

  const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnpParams, { encode: false });
  
  return paymentUrl;
}

/**
 * Verify VNPay return/IPN data
 * @param {Object} vnpParams - Query parameters from VNPay
 * @returns {Object} { isValid: boolean, data: Object }
 */
function verifyReturn(vnpParams) {
  const secureHash = vnpParams.vnp_SecureHash;
  
  // Remove hash params
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  // Sort params
  const sortedParams = sortObject(vnpParams);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const checkSum = createSignature(signData, vnpayConfig.vnp_HashSecret);

  const isValid = secureHash === checkSum;

  return {
    isValid,
    data: {
      orderId: vnpParams.vnp_TxnRef,
      amount: parseInt(vnpParams.vnp_Amount) / 100,
      orderInfo: vnpParams.vnp_OrderInfo,
      responseCode: vnpParams.vnp_ResponseCode,
      transactionNo: vnpParams.vnp_TransactionNo,
      bankCode: vnpParams.vnp_BankCode,
      payDate: vnpParams.vnp_PayDate,
      transactionStatus: vnpParams.vnp_TransactionStatus,
    },
  };
}

module.exports = {
  createPaymentUrl,
  verifyReturn,
  sortObject,
  createSignature,
};

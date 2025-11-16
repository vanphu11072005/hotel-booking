/**
 * VNPay integration removed
 * This file is intentionally left as a stub to indicate the VNPay
 * payment gateway has been removed from the project. Any attempt
 * to require this module should be considered a usage error.
 */

module.exports = {
  // No-op placeholders
  createPaymentUrl: () => {
    throw new Error('VNPay integration has been removed');
  },
  verifyReturn: () => {
    throw new Error('VNPay integration has been removed');
  },
  sortObject: () => ({}),
  createSignature: () => '',
};

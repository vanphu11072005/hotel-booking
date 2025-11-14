// VNPay integration removed.
// This file intentionally left as a stub to avoid import errors
// in case any reference still exists. If you want this file fully
// deleted, remove any remaining imports and then delete this file.

module.exports = {
  createPaymentUrl: () => {
    throw new Error('VNPay integration removed');
  },
  verifyReturnUrl: () => {
    throw new Error('VNPay integration removed');
  },
  getSupportedBanks: () => [],
};

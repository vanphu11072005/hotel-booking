const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique booking number
 */
const generateBookingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `BK${year}${month}${day}${random}`;
};

/**
 * Calculate number of nights between dates
 */
const calculateNights = (checkIn, checkOut) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.round(Math.abs((end - start) / oneDay));
};

/**
 * Check if date ranges overlap
 */
const checkDateOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Format price to Vietnamese dong
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

/**
 * Generate UUID
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Parse pagination params
 */
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const pageSize = Math.min(
    parseInt(query.pageSize) ||
      parseInt(process.env.DEFAULT_PAGE_SIZE) ||
      10,
    parseInt(process.env.MAX_PAGE_SIZE) || 100
  );
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    offset,
    limit: pageSize
  };
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
};

/**
 * Get file extension
 */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

module.exports = {
  generateBookingNumber,
  calculateNights,
  checkDateOverlap,
  formatPrice,
  generateUUID,
  parsePagination,
  sanitizeFilename,
  getFileExtension
};

/**
 * Send success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 */
const sendError = (
  res,
  message = 'Error',
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const sendPaginated = (
  res,
  data,
  page,
  pageSize,
  total,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / pageSize);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};

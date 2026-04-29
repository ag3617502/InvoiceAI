const logger = require('./logger');

const successResponse = (res, data, message = 'Success', status = 200, pagination = null) => {
  const response = {
    success: true,
    data,
    message,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  // Log successful event
  logger.info(`[SUCCESS] ${res.req.method} ${res.req.originalUrl} - Status: ${status} - Message: ${message}`);

  return res.status(status).json(response);
};

const errorResponse = (res, error = 'SERVER_ERROR', message = 'Internal Server Error', status = 500, details = []) => {
  // Log error event
  logger.error(`[ERROR] ${res.req.method} ${res.req.originalUrl} - Status: ${status} - Error: ${error} - Message: ${message}`);

  return res.status(status).json({
    success: false,
    error,
    message,
    details,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};

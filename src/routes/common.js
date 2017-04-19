const logger = require('../utils/logger');

function internalServerError(reason, response) {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
}

function invalidRequestBodyError(reasons, response) {
  logger.warn(`Request body is invalid: ${reasons[0].message}`);
  return response.status(400).json({ code: 400, message: `Invalid body: ${reasons[0].message}` });
}

module.exports = { internalServerError, invalidRequestBodyError };
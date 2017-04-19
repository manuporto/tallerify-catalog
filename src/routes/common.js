const logger = require('../utils/logger');

function internalServerError(reason, response) {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
}

module.exports = { internalServerError };
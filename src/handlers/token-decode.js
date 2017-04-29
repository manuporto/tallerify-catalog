const logger = require('./../utils/logger');
const jwt = require('jsonwebtoken');

const idFromToken = (token) => {
  logger.info(`Decoding token: ${token}`);
  return jwt.decode(token).id;
};

module.exports = { idFromToken };

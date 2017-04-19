const logger = require('../utils/logger');
const promisify = require('promisify-node');
const amanda = require('amanda');
const jsonSchemaValidator = amanda('json');

function internalServerError(reason, response) {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
}

function validateJson(body, schema, callback) {
  logger.info(`Validating request "${JSON.stringify(body, null, 4)}"`);
  return jsonSchemaValidator.validate(body, schema, callback);
}

const validateRequestBody = promisify(validateJson);

function invalidRequestBodyError(reasons, response) {
  const message = `Request body is invalid: ${reasons[0].message}`;
  logger.warn(message);
  return response.status(400).json({ code: 400, message: message });
}

module.exports = { internalServerError, validateRequestBody, invalidRequestBodyError };
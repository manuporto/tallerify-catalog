const logger = require('../utils/logger');
const promisify = require('promisify-node');
const amanda = require('amanda');
const jsonSchemaValidator = amanda('json');

const internalServerError = (reason, response) => {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
};

function validateJson(body, schema, callback) {
  logger.info(`Validating request "${JSON.stringify(body, null, 4)}"`);
  return jsonSchemaValidator.validate(body, schema, callback);
}

const validateRequestBody = promisify(validateJson);

const entryExists = (id, entry, response) => {
  if (!entry) {
    logger.warn(`No entry with id ${id}`);
    response.status(404).json({ code: 404, message: `No admin with id ${id}` });
    return false;
  }
  return true;
};

const invalidRequestBodyError = (reasons, response) => {
  const message = `Request body is invalid: ${reasons[0].message}`;
  logger.warn(message);
  return response.status(400).json({ code: 400, message: message });
};

module.exports = { internalServerError, validateRequestBody, entryExists, invalidRequestBodyError };

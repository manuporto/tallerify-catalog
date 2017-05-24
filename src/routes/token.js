const logger = require('../utils/logger');
const db = require('./../handlers/db/generalHandler');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');
const jwt = require('jsonwebtoken');

const expectedBodySchema = {
  type: 'object',
  properties: {
    userName: {
      required: true,
      type: 'string',
    },
    password: {
      required: true,
      type: 'string',
    },
  },
};

const resultIsValid = (result, response) => {
  logger.info(`Validating result ${JSON.stringify(result)}`);
  if (!result) {
    respond.nonexistentCredentials(response);
    return false;
  }
  return true;
};

const getToken = (secret, user) => jwt.sign(user, secret, {
  expiresIn: '24h',
});

/* Routes */

const generateToken = (req, res) => {
  respond.successfulUserTokenGeneration(req.user, getToken(req.app.get('secret'), req.user), res);
};

const generateAdminToken = (req, res) => respond.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword(tables.admins, req.body.userName, req.body.password)
        .then((admin) => {
          if (!resultIsValid(admin, res)) return;
          respond.successfulAdminTokenGeneration(admin, getToken(req.app.get('secret'), admin), res);
        }).catch(reason => respond.internalServerError(reason, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));

module.exports = { generateToken, generateAdminToken };

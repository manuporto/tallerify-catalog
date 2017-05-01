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
  if (result.length === 0) {
    respond.nonexistentCredentials(response);
    return false;
  }
  if (result.length > 1) {
    respond.inconsistentCredentials(response);
    return false;
  }
  return true;
};

const getToken = (secret, user) => {
  return jwt.sign(user, secret, {
    expiresIn: '24h',
  });
};

/* Routes */

const generateToken = (req, res) => {
  respond.successfulUserTokenGeneration(req.user, getToken(req.app.get('secret'), req.user), res);
};

const generateAdminToken = (req, res) => {
  return respond.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword(tables.admins, req.body.userName, req.body.password)
        .then((admins) => {
          if (!resultIsValid(admins, res)) return;
          respond.successfulAdminTokenGeneration(admins[0], getToken(req.app.get('secret'), admins[0]), res);
        }).catch(reason => respond.internalServerError(reason, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

module.exports = { generateToken, generateAdminToken };

const db = require('./db');
const common = require('./common');

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
    common.nonexistentCredentials(response);
    return false;
  }
  if (result.length > 1) {
    common.inconsistentCredentials(response);
    return false;
  }
  return true;
};

/* Routes */

const generateToken = (req, res) => {
  return common.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword('users', req.body.userName, req.body.password)
        .then((users) => {
          if (!resultIsValid(users, res)) return;
          common.successfulUserTokenGeneration(users[0], res);
        })
        .catch(reason => common.internalServerError(reason, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const generateAdminToken = (req, res) => {
  return common.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword('admins', req.body.userName, req.body.password)
        .then((admins) => {
          if (!resultIsValid(admins, res)) return;
          common.successfulAdminTokenGeneration(admins[0], res);
        }).catch(reason => common.internalServerError(reason, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

module.exports = { generateToken, generateAdminToken };

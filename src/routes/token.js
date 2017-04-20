const db = require('./../dbHandlers/db');
const respond = require('./response');

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

/* Routes */

const generateToken = (req, res) => {
  return respond.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword('users', req.body.userName, req.body.password)
        .then((users) => {
          if (!resultIsValid(users, res)) return;
          respond.successfulUserTokenGeneration(users[0], res);
        })
        .catch(reason => respond.internalServerError(reason, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const generateAdminToken = (req, res) => {
  return respond.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      db.findWithUsernameAndPassword('admins', req.body.userName, req.body.password)
        .then((admins) => {
          if (!resultIsValid(admins, res)) return;
          respond.successfulAdminTokenGeneration(admins[0], res);
        }).catch(reason => respond.internalServerError(reason, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

module.exports = { generateToken, generateAdminToken };

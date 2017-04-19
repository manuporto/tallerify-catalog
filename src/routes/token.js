const winston = require('winston');
const promisify = require('promisify-node');
const amanda = require('amanda');
const models = require('../models/index');

const jsonSchemaValidator = amanda('json');

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

function validateRequestBody(body, callback) {
  winston.log('info', `Validating request "${JSON.stringify(body, null, 4)}"`);
  return jsonSchemaValidator.validate(body, expectedBodySchema, callback);
}

const validateJson = promisify(validateRequestBody);

function invalidRequestBodyError(reasons, response) {
  winston.log('warn', `Request body is invalid: ${reasons[0].message}`);
  return response.status(400).json({ code: 400, message: `Invalid body: ${reasons[0].message}` });
}

function findWithUsernameAndPassword(model, username, password) {
  winston.log('info', `Querying database for entry with username "${username}" and password "${password}"`);
  return model.findAll({
    where: {
      userName: username,
      password: password,
    },
  });
}

function resultIsValid(result, response) {
  if (result.length === 0) {
    winston.log('warn', 'No entry with such credentials');
    response.status(500).json({ code: 500, message: 'No entry with such credentials' });
    return false;
  }
  if (result.length > 1) {
    winston.log('warn', `There is more than one entry with those credentials "${result}"`);
    response.status(500).json({ code: 500, message: 'There is more than one entry with those credentials' });
    return false;
  }
  return true;
}

function successfulTokenGeneration(result, response) {
  winston.log('info', `Response: ${result}`);
  response.status(201).json(result);
}

function successfulUserTokenGeneration(user, response) {
  const result = Object.assign(
    {},
    {
      token: user.id.toString(),
      user: {
        id: user.id,
        href: user.href,
        userName: user.userName,
      },
    });
  successfulTokenGeneration(result, response);
}

function successfulAdminTokenGeneration(admin, response) {
  const result = Object.assign(
    {},
    {
      token: admin.id.toString(),
      admin: {
        id: admin.id,
        userName: admin.userName,
      },
    });
  successfulTokenGeneration(result, response);
}

function internalServerError(reason, response) {
  winston.log('warn', `Unexpected error: ${reason}`);
  return response.status(500).json({ code: 500, message: `Unexpected error: ${reason}` });
}

const generateToken = (req, res) => {
  winston.log('info', 'POST /api/tokens');
  return validateJson(req.body)
    .then(() => {
      findWithUsernameAndPassword(models.users, req.body.userName, req.body.password)
        .then((users) => {
          if (!resultIsValid(users, res)) return;
          successfulUserTokenGeneration(users[0], res);
        }).catch((reason) => {
          internalServerError(reason, res);
        });
    })
    .catch((error) => {
      invalidRequestBodyError(error, res);
    });
};

const generateAdminToken = (req, res) => {
  winston.log('info', 'POST /api/tokens/admins');
  return validateJson(req.body)
    .then(() => {
      findWithUsernameAndPassword(models.admins, req.body.userName, req.body.password)
        .then((admins) => {
          if (!resultIsValid(admins, res)) return;
          successfulAdminTokenGeneration(admins[0], res);
        }).catch((reason) => {
          internalServerError(reason, res);
        });
    })
    .catch((error) => {
      invalidRequestBodyError(error, res);
    });
};

module.exports = { generateToken, generateAdminToken };

const logger = require('../utils/logger');
const models = require('../models/index');
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

function findWithUsernameAndPassword(model, username, password) {
  logger.info(`Querying database for entry with username "${username}" and password "${password}"`);
  return model.findAll({
    where: {
      userName: username,
      password: password,
    },
  });
}

function resultIsValid(result, response) {
  if (result.length === 0) {
    logger.warn('No entry with such credentials');
    response.status(500).json({ code: 500, message: 'No entry with such credentials' });
    return false;
  }
  if (result.length > 1) {
    logger.warn(`There is more than one entry with those credentials "${result}"`);
    response.status(500).json({ code: 500, message: 'There is more than one entry with those credentials' });
    return false;
  }
  return true;
}

function successfulTokenGeneration(result, response) {
  logger.info(`Response: ${result}`);
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

const generateToken = (req, res) => {
  return common.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      findWithUsernameAndPassword(models.users, req.body.userName, req.body.password)
        .then((users) => {
          if (!resultIsValid(users, res)) return;
          successfulUserTokenGeneration(users[0], res);
        })
        .catch(reason => common.internalServerError(reason, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const generateAdminToken = (req, res) => {
  return common.validateRequestBody(req.body, expectedBodySchema)
    .then(() => {
      findWithUsernameAndPassword(models.admins, req.body.userName, req.body.password)
        .then((admins) => {
          if (!resultIsValid(admins, res)) return;
          successfulAdminTokenGeneration(admins[0], res);
        }).catch(reason => common.internalServerError(reason, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

module.exports = { generateToken, generateAdminToken };

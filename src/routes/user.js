const logger = require('../utils/logger');
const promisify = require('promisify-node');
const amanda = require('amanda');
const models = require('../models/index');
const common = require('./common');
const constants = require('./constants.json');

const jsonSchemaValidator = amanda('json');

const userExpectedBodySchema = {
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
    firstName: {
      required: true,
      type: 'string',
    },
    lastName: {
      required: true,
      type: 'string',
    },
    country: {
      required: true,
      type: 'string',
    },
    email: {
      required: true,
      type: 'string',
      format: 'email',
    },
    birthdate: {
      required: true,
      type: 'string',
    },
  },
};

const updateUserExpectedBodySchema = {
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
        firstName: {
            required: true,
            type: 'string',
        },
        lastName: {
            required: true,
            type: 'string',
        },
        country: {
            required: true,
            type: 'string',
        },
        email: {
            required: true,
            type: 'string',
            format: 'email',
        },
        birthdate: {
            required: true,
            type: 'string',
        },
        images: {
            required: true,
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
};

function validateRequestBody(body, schema, callback) {
  logger.info(`Validating request "${JSON.stringify(body, null, 4)}"`);
  return jsonSchemaValidator.validate(body, schema, callback);
}

const validateJson = promisify(validateRequestBody);

function findAllUsers() {
  logger.debug('Getting all users.');
  return models.users.findAll({});
}

function successfulUsersFetch(users, response) {
  return response.status(200).json({
    metadata: {
      count: users.length,
      version: constants.API_VERSION,
    },
    users,
  });
}

function findUserWithId(id) {
  logger.info(`Searching for user ${id}`);
  return models.users.find({
    where: {
      id: id,
    },
  });
}

function userExists(id, user, response) {
  if (!user) {
    logger.warn(`No user with id ${id}`);
    response.status(404).json({ code: 404, message: `No user with id ${id}` });
    return false;
  }
  return true;
}

function successfulUserFetch(user, response) {
  return response.status(200).json(user);
}

function createNewUser(body) {
  logger.info('Creating user');
  return models.users.create({
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: [constants.DEFAULT_IMAGE],
  });
}

function successfulUserCreation(user, response) {
  response.status(201).json(user);
}

function updateUserInfo(user, body) {
  logger.info('Updating user');
  return user.updateAttributes({
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    email: body.email,
    birthdate: body.birthdate,
    images: body.images,
  });
}

function successfulUserUpdate(user, response) {
  response.status(200).json(user);
}

function deleteUserWithId(id) {
  logger.info(`Deleting user ${id}`);
  return models.users.destroy({
    where: {
      id: id,
    },
  });
}

function successfulUserDeletion(response) {
  logger.info('Successful user deletion');
  response.sendStatus(204);
}

const getUsers = (req, res) => {
  findAllUsers()
    .then(users => successfulUsersFetch(users, res))
    .catch(error => common.internalServerError(error, res));
};

const getUser = (req, res) => {
  findUserWithId(req.params.id)
    .then((user) => {
      if (!userExists(req.params.id, user, res)) return;
      successfulUserFetch(user, res);
    })
    .catch(error => common.internalServerError(error, res));
};

const newUser = (req, res) => {
  validateJson(req.body, userExpectedBodySchema)
    .then(() => {
      createNewUser(req.body)
        .then(user => successfulUserCreation(user, res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const updateUser = (req, res) => {
  validateJson(req.body, updateUserExpectedBodySchema)
    .then(() => {
      findUserWithId(req.params.id)
        .then((user) => {
          if (!userExists(req.params.id, user, res)) return;
          updateUserInfo(user, req.body)
          .then(updatedUser => successfulUserUpdate(updatedUser, res))
          .catch(error => common.internalServerError(error, res));
        })
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const deleteUser = (req, res) => {
  findUserWithId(req.params.id)
    .then((user) => {
      if (!userExists(req.params.id, user, res)) return;
      deleteUserWithId(req.params.id)
        .then(() => successfulUserDeletion(res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.internalServerError(error, res));
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser };

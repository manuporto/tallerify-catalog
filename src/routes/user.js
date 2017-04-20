const logger = require('../utils/logger');
const models = require('../models/index');
const db = require('./db');
const common = require('./common');
const constants = require('./constants.json');

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

function userExists(id, user, response) {
  if (!user) {
    logger.warn(`No user with id ${id}`);
    response.status(404).json({ code: 404, message: `No user with id ${id}` });
    return false;
  }
  return true;
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

function successfulUsersFetch(users, response) {
  logger.info('Successful users fetch');
  return response.status(200).json({
    metadata: {
      count: users.length,
      version: constants.API_VERSION,
    },
    users,
  });
}

function successfulUserFetch(user, response) {
  logger.info('Successful user fetch');
  response.status(200).json(user);
}

function successfulUserCreation(user, response) {
  logger.info('Successful user creation');
  response.status(201).json(user);
}

function successfulUserUpdate(user, response) {
  logger.info('Successful user update');
  response.status(200).json(user);
}

function successfulUserDeletion(response) {
  logger.info('Successful user deletion');
  response.sendStatus(204);
}

/* Routes */

const getUsers = (req, res) => {
  db.findAllEntries(models.users)
    .then(users => successfulUsersFetch(users, res))
    .catch(error => common.internalServerError(error, res));
};

const getUser = (req, res) => {
  db.findEntryWithId(models.users, req.params.id)
    .then((user) => {
      if (!userExists(req.params.id, user, res)) return;
      successfulUserFetch(user, res);
    })
    .catch(error => common.internalServerError(error, res));
};

const newUser = (req, res) => {
  common.validateRequestBody(req.body, userExpectedBodySchema)
    .then(() => {
      createNewUser(req.body)
        .then(user => successfulUserCreation(user, res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const updateUser = (req, res) => {
  common.validateRequestBody(req.body, updateUserExpectedBodySchema)
    .then(() => {
      db.findEntryWithId(models.users, req.params.id)
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
  db.findEntryWithId(models.users, req.params.id)
    .then((user) => {
      if (!userExists(req.params.id, user, res)) return;
      db.deleteEntryWithId(models.users, req.params.id)
        .then(() => successfulUserDeletion(res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.internalServerError(error, res));
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser };

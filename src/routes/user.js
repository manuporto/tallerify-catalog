const logger = require('../utils/logger');
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

const getUsers = (req, res) => {
  logger.debug('Getting all users.');
  return models.users.findAll({}).then((users) => { // eslint-disable-line arrow-body-style
    return res.status(200).json({
      metadata: {
        count: users.length,
        version: constants.API_VERSION,
      },
      users,
    });
  }).catch((reason) => {
    common.internalServerError(reason, res);
  });
};

const getUser = (req, res) => {
  logger.info(`Searching for user ${req.params.id}`);
  return models.users.find({
    where: {
      id: req.params.id,
    },
  }).then((user) => {
    if (!user) {
      const message = `No user with id ${req.params.id}`;
      logger.warn(message);
      return res.status(404).json({ code: 404, message });
    }
    return res.status(200).json(user);
  }).catch((reason) => {
    common.internalServerError(reason, res);
  });
};

const newUser = (req, res) => {
  logger.info(`Validating request body "${JSON.stringify(req.body, null, 4)}"`);
  return jsonSchemaValidator.validate(req.body, userExpectedBodySchema, (error) => {
    if (error) {
      logger.warn(`Request body is invalid: ${error[0].message}`);
      return res.status(400).json({ code: 400, message: `Invalid body: ${error[0].message}` });
    }
    return models.users.create({
      userName: req.body.userName,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      country: req.body.country,
      email: req.body.email,
      birthdate: req.body.birthdate,
      images: [ constants.DEFAULT_IMAGE ],
    }).then(user => res.status(201).json(user))
    .catch((reason) => {
      common.internalServerError(reason, res);
    });
  });
};


const updateUser = (req, res) => {
  logger.info(`Validating request body "${JSON.stringify(req.body, null, 4)}"`);
  return jsonSchemaValidator.validate(req.body, updateUserExpectedBodySchema, (error) => {
    if (error) {
      logger.warn(`Request body is invalid: ${error[0].message}`);
      return res.status(400).json({ code: 400, message: `Invalid body: ${error[0].message}` });
    }
    logger.info(`Searching for user ${req.params.id}`);
    return models.users.find({
      where: {
        id: req.params.id,
      },
    }).then((user) => {
      if (!user) {
        logger.warn(`No user with id ${req.params.id}`);
        return res.status(404).json({ code: 404, message: `No user with id ${req.params.id}` });
      }
      logger.info(`Found, updating user ${req.params.id}`);

      return user.updateAttributes({
        userName: req.body.userName,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        country: req.body.country,
        email: req.body.email,
        birthdate: req.body.birthdate,
        images: req.body.images,
      }).then((user) => { // eslint-disable-line no-shadow
        res.status(200).json(user);
      }).catch((reason) => {
        common.internalServerError(reason, res);
      });
    }).catch((reason) => {
      common.internalServerError(reason, res);
    });
  });
};

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

const deleteUser = (req, res) => {
  findUserWithId(req.params.id)
  .then((user) => {
    if (!userExists(req.params.id, user, res)) return;
    deleteUserWithId(req.params.id)
    .then(() => {
      successfulUserDeletion(res);
    }).catch((reason) => {
      common.internalServerError(reason, res);
    });
  }).catch((reason) => {
    common.internalServerError(reason, res);
  });
};

module.exports = { getUsers, getUser, newUser, updateUser, deleteUser };

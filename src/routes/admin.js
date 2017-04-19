const logger = require('../utils/logger');
const amanda = require('amanda');
const models = require('../models/index');
const constants = require('./constants.json');

const jsonSchemaValidator = amanda('json');

const adminExpectedBodySchema = {
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
    email: {
      required: true,
      type: 'string',
      format: 'email',
    },
  },
};

const getAdmins = (req, res) => {
  logger.debug('Getting all admins.');
  return models.admins.findAll({}).then(admins => { // eslint-disable-line arrow-body-style
    return res.status(200).json({
      metadata: {
        count: admins.length,
        version: constants.API_VERSION,
      },
        admins,
    });
  }).catch((reason) => {
    const message = `Unexpected error: ${reason}`;
    logger.warn(message);
    return res.status(500).json({ code: 500, message });
  });
};

const newAdmin = (req, res) => {
  logger.info(`Validating request body "${JSON.stringify(req.body, null, 4)}"`);
  return jsonSchemaValidator.validate(req.body, adminExpectedBodySchema, (error) => {
    if (error) {
      logger.warn(`Request body is invalid: ${error[0].message}`);
      return res.status(400).json({ code: 400, message: `Invalid body: ${error[0].message}` });
    }
    return models.admins.create({
      userName: req.body.userName,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      birthdate: req.body.birthdate,
    }).then(admin => res.status(201).json(admin))
    .catch((reason) => {
      const message = `Unexpected error: ${reason}`;
      logger.warn(message);
      return res.status(500).json({ code: 500, message });
    });
  });
};

const deleteAdmin = (req, res) => {
  logger.info(`Searching for admin ${req.params.id}`);
  return models.admins.find({
    where: {
      id: req.params.id,
    },
  }).then(admin => {
    if (!admin) {
      logger.warn(`No admin with id ${req.params.id}`);
      return res.status(404).json({ code: 404, message: `No admin with id ${req.params.id}` });
    }

    logger.info(`Found, deleting admin ${req.params.id}`);
    return models.admins.destroy({
      where: {
        id: req.params.id,
      },
    }).then(() => {
      logger.info('Successful admin deletion');
      return res.sendStatus(204);
    }).catch((reason) => {
      const message = `Unexpected error: ${reason}`;
      logger.warn(message);
      return res.status(500).json({ code: 500, message });
    });
  }).catch((reason) => {
    const message = `Unexpected error: ${reason}`;
    logger.warn(message);
    return res.status(500).json({ code: 500, message });
  });
};

module.exports = { getAdmins, newAdmin, deleteAdmin };

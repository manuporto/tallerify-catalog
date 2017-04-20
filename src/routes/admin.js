const logger = require('../utils/logger');
const amanda = require('amanda');
const models = require('../models/index');
const constants = require('./constants.json');
const common = require('./common');

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

function findAllAdmins() {
  logger.debug('Getting all admins.');
  return models.admins.findAll({});
}

function findAdminWithId(id) {
  logger.info(`Searching for admin ${id}`);
  return models.admins.find({
    where: {
      id: id,
    },
  });
}

function createNewAdmin(body) {
  logger.info('Creating admin');
  return models.admins.create({
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email
  });
}

function deleteAdminWithId(id) {
  logger.info(`Deleting admin ${id}`);
  return models.admins.destroy({
    where: {
      id: id,
    },
  });
}

function adminExists(id, admin, response) {
  if (!admin) {
    logger.warn(`No admin with id ${id}`);
    response.status(404).json({ code: 404, message: `No admin with id ${id}` });
    return false;
  }
  return true;
}

function successfulAdminsFetch(admins, response) {
  logger.info('Successful admins fetch');
  return response.status(200).json({
    metadata: {
      count: admins.length,
      version: constants.API_VERSION,
    },
    admins,
  });
}

function successfulAdminCreation(admin, response) {
  logger.info('Successful admin creation');
  response.status(201).json(admin);
}


function successfulAdminDeletion(response) {
  logger.info('Successful admin deletion');
  response.sendStatus(204);
}

/* Routes */

const getAdmins = (req, res) => {
  findAllAdmins()
    .then(admins => successfulAdminsFetch(admins, res))
    .catch(error => common.internalServerError(error, res));
};


const newAdmin = (req, res) => {
  common.validateRequestBody(req.body, adminExpectedBodySchema)
    .then(() => {
      createNewAdmin(req.body)
        .then(admin => successfulAdminCreation(admin, res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.invalidRequestBodyError(error, res));
};

const deleteAdmin = (req, res) => {
  findAdminWithId(req.params.id)
    .then((admin) => {
      if (!adminExists(req.params.id, admin, res)) return;
      deleteAdminWithId(req.params.id)
        .then(() => successfulAdminDeletion(res))
        .catch(error => common.internalServerError(error, res));
    })
    .catch(error => common.internalServerError(error, res));
};

module.exports = { getAdmins, newAdmin, deleteAdmin };

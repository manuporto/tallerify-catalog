const constants = require('./../routes/constants.json');
const logger = require('../utils/logger');
const amanda = require('amanda');

const jsonSchemaValidator = amanda('json');

const internalServerError = (reason, response) => {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
};

const unauthorizedError = (reason, response) => {
  const message = `Unauthorized: ${reason}`;
  logger.warn(message);
  response.status(401).json({ code: 401, message: message });
};

const validateRequestBody = (body, schema) => {
  logger.info(`Validating request "${JSON.stringify(body, null, 4)}"`);
  return new Promise((resolve, reject) => {
    jsonSchemaValidator.validate(body, schema, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const invalidRequestBodyError = (reasons, response) => {
  const message = `Request body is invalid: ${reasons[0].message}`;
  logger.warn(message);
  return response.status(400).json({ code: 400, message: message });
};

const entryExists = (id, entry, response) => {
  if (!entry.length) {
    logger.warn(`No entry with id ${id}`);
    response.status(404).json({ code: 404, message: `No entry with id ${id}` });
    return false;
  }
  return true;
};

/* Users */

const successfulUsersFetch = (users, response) => {
  logger.info('Successful users fetch');
  return response.status(200).json({
    metadata: {
      count: users.length,
      version: constants.API_VERSION,
    },
    users,
  });
};

const successfulUserFetch = (user, response) => {
  logger.info('Successful user fetch');
  response.status(200).json({
    metadata: {
      count: 1,
      version: constants.API_VERSION,
    },
    user: user[0],
  });
};

const successfulUserCreation = (user, response) => {
  logger.info('Successful user creation');
  response.status(201).json(user[0]);
};

const successfulUserUpdate = (user, response) => {
  logger.info('Successful user update');
  response.status(200).json(user[0]);
};

const successfulUserDeletion = (response) => {
  logger.info('Successful user deletion');
  response.sendStatus(204);
};

const successfulUserContactsFetch = (contacts, response) => {
  logger.info('Successful contacts fetch');
  response.status(200).json({
    metadata: {
      count: contacts.length,
      version: constants.API_VERSION,
    },
    contacts,
  });
};

/* Admins */

const successfulAdminsFetch = (admins, response) => {
  logger.info('Successful admins fetch');
  return response.status(200).json({
    metadata: {
      count: admins.length,
      version: constants.API_VERSION,
    },
    admins,
  });
};

const successfulAdminCreation = (admin, response) => {
  logger.info('Successful admin creation');
  response.status(201).json(admin[0]);
};

const successfulAdminDeletion = (response) => {
  logger.info('Successful admin deletion');
  response.sendStatus(204);
};

/* Tokens */

const nonexistentCredentials = (response) => {
  const message = 'No entry with such credentials';
  logger.warn(message);
  response.status(500).json({ code: 500, message: message });
};

const inconsistentCredentials = (response) => {
  const message = 'There is more than one entry with those credentials';
  logger.warn(message);
  response.status(500).json({ code: 500, message: message });
};

const successfulTokenGeneration = (result, response) => {
  logger.info('Successful token generation');
  response.status(201).json(result);
};

const successfulUserTokenGeneration = (user, token, response) => {
  const result = Object.assign(
    {},
    {
      token: token,
      user: {
        id: user.id,
        href: user.href,
        userName: user.userName,
      },
    });
  successfulTokenGeneration(result, response);
};

const successfulAdminTokenGeneration = (admin, token, response) => {
  const result = Object.assign(
    {},
    {
      token: token,
      admin: {
        id: admin.id,
        userName: admin.userName,
      },
    });
  successfulTokenGeneration(result, response);
};

/* Artists */

const successfulArtistsFetch = (artists, res) => {
  logger.info('Successful artists fetch');
  return res.status(200).json({
    metadata: {
      count: artists.length,
      version: constants.API_VERSION,
    },
    artists,
  });
};

const successfulArtistCreation = (artist, res) => {
  logger.info('Successful artist creation');
  res.status(201).json(artist[0]);
};

/* Tracks */

const succesfulTracksFetch = (tracks, res) => {
  logger.info('Successful tracks fetch');
  return res.status(200).json({
    metadata: {
      count: tracks.length,
      version: constants.API_VERSION,
    },
    tracks,
  });
};

module.exports = {
  internalServerError,
  unauthorizedError,
  validateRequestBody,
  entryExists,
  invalidRequestBodyError,
  successfulUsersFetch,
  successfulUserFetch,
  successfulUserCreation,
  successfulUserUpdate,
  successfulUserDeletion,
  successfulUserContactsFetch,
  successfulAdminsFetch,
  successfulAdminCreation,
  successfulAdminDeletion,
  nonexistentCredentials,
  inconsistentCredentials,
  successfulUserTokenGeneration,
  successfulAdminTokenGeneration,
  successfulArtistsFetch,
  successfulArtistCreation,
  succesfulTracksFetch,
};

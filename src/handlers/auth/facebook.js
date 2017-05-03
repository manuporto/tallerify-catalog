const logger = require('../../utils/logger');
const request = require('request');
const db = require('../db');
const tables = require('../../database/tableNames');
const respond = require('./../response');

const provider = 'https://graph.facebook.com/v2.9/me';

const validateWithProvider = (socialToken) => {
  return new Promise((resolve, reject) => {
    // Send a GET request to Facebook with the token as query string
    request.get({
      url: provider,
      qs: {
        access_token: socialToken,
        fields: 'id, name, birthday, email, location'
      }
    },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          logger.info(`FB GRAPH RESPONSE ${JSON.stringify(response.body)}`);
          resolve(JSON.parse(body));
        } else {
          logger.warn(`FB GRAPH RESPONSE ${JSON.stringify(response)}`);
          reject(error);
        }
      });
  });
};

const checkCredentials = (credentials) => {
  logger.info(`Validating credentials: ${JSON.stringify(credentials)}`);
  return validateWithProvider(credentials.authToken);
};

const handleLogin = (req, res, next, fUser) => {
  db.general.findOneWithAttributes(tables.users, {
    facebookUserId: fUser.id,
  }).then((user) => {
    if (user) {
      req.user = user;
      next();
    } else {
      db.general.createNewEntry(tables.users, {
        facebookUserId: fUser.id,
        facebookAuthToken: req.body.authToken,
        userName: fUser.name,
        firstName: fUser.name,
        lastName: fUser.name,
        email: fUser.email,
        country: (fUser.hasOwnProperty('location')) ? fUser.location.name : '',
        birthdate: fUser.birthday,
      }).then((newUser) => {
        req.user = newUser[0];
        next();
      }).catch((error) => {
        respond.internalServerError(error, res);
      });
    }
  });
};

module.exports = { checkCredentials, handleLogin };

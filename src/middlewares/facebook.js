const logger = require('../utils/logger');
const request = require('request');
const db = require('../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

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
          const errMsg = JSON.parse(response.body).error.message;
          logger.warn(`FB GRAPH RESPONSE ${errMsg}`);
          reject(errMsg);
        }
      });
  });
};

const createDbUserObject = (user) => {
  const names = user.name.split(' ');
  const defaultMissingValue = 'unknown';
  const userName = names.join('_').toLowerCase();
  const defaultFirstName = names[0];
  const defaultLastName = (names.length > 0) ? names.slice(-1)[0] : defaultMissingValue;
  return {
        userName,
        facebookUserId: user.id,
        facebookAuthToken: user.authToken,
        birthdate: user.birthday,
        firstName: (user.hasOwnProperty('first_name')) ? user.first_name : defaultFirstName,
        lastName: (user.hasOwnProperty('last_name')) ? user.last_name : defaultLastName,
        email: (user.hasOwnProperty('email')) ? user.email : defaultMissingValue,
        country: (user.hasOwnProperty('location')) ? user.location.name : defaultMissingValue,
      };
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
      fUser.authToken = req.body.authToken;
      db.general.createNewEntry(tables.users, createDbUserObject(fUser))
        .then((newUser) => {
          req.user = newUser[0];
          next();
        })
        .catch((error) => {
          respond.internalServerError(error, res);
        });
    }
  });
};

module.exports = { checkCredentials, handleLogin };

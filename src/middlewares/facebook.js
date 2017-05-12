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
        fields: 'id, name, first_name, last_name, birthday, email, location'
      }
    },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const resBody = JSON.parse(response.body);
          logger.debug(`Facebook graph response: ${JSON.stringify(resBody, null, 4)}`);
          resolve(JSON.parse(body));
        } else {
          const errMsg = JSON.parse(response.body).error.message;
          reject(errMsg);
        }
      });
  });
};

const createDbUserObject = (user) => {
  const defaultMissingValue = 'unknown';
  return {
        userName: user.name.split(' ').join('_').toLowerCase(),
        facebookUserId: user.id,
        facebookAuthToken: user.authToken,
        birthdate: user.birthday,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        country: (user.hasOwnProperty('location')) ? user.location.name : defaultMissingValue,
      };
};

const createFacebookUser = (req, user) => {
  user.authToken = req.body.authToken;
  return db.general.createNewEntry(tables.users, createDbUserObject(user));
};

const checkCredentials = (credentials) => {
  logger.info(`Validating credentials: ${JSON.stringify(credentials)}`);
  return validateWithProvider(credentials.authToken);
};

const handleLogin = (req, res, next, fUser) => {
  db.user.findWithFacebookUserId(fUser.id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        createFacebookUser(req, fUser)
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

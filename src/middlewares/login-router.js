const respond = require('../handlers/response');
const facebook = require('./facebook');
const db = require('../handlers/db');
const tables = require('../database/tableNames');

const facebookLogin = {
  type: 'object',
  properties: {
    userId: {
      required: true,
      type: 'string',
    },
    authToken: {
      required: true,
      type: 'string',
    },
  },
};

const nativeLogin = {
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

const facebookUser = {
  type: 'object',
  properties: {
    id: {
      required: true,
      type: 'string',
    },
    name: {
      required: true,
      type: 'string',
    },
    first_name: {
      required: true,
      type: 'string',
    },
    last_name: {
      required: true,
      type: 'string',
    },
    email: {
      required: true,
      type: 'string',
    },
    location: {
      required: false,
      type: 'object',
    },
    birthday: {
      required: true,
      type: 'string',
    },
  },
};

const getNativeUserToken = (req, res, next) => {
  db.general.findWithUsernameAndPassword(tables.users, req.body.userName, req.body.password)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        respond.nonexistentCredentials(res);
      }
    })
    .catch(error => respond.internalServerError(error, res));
};

const getFacebookUserToken = (req, res, next) => {
  facebook.checkCredentials(req.body)
    .then((fUser) => {
      respond.validateRequestBody(fUser, facebookUser)
        .then(() => facebook.handleLogin(req, res, next, fUser))
        .catch(error => respond.invalidRequestBodyError(error, res));
    })
    .catch(error => respond.unauthorizedError(error, res));
};

const loginRouter = (req, res, next) => {
  respond.validateRequestBody(req.body, nativeLogin)
    .then(() => getNativeUserToken(req, res, next))
    .catch(() => {
      respond.validateRequestBody(req.body, facebookLogin)
        .then(() => getFacebookUserToken(req, res, next))
        .catch(error => respond.invalidRequestBodyError(error, res));
    });
};

module.exports = loginRouter;

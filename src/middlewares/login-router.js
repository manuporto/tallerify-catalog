const logger = require('../utils/logger');
const respond = require('../handlers/response');
const facebook = require('../handlers/auth/facebook');
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

const loginRouter = (req, res, next) => {
  respond.validateRequestBody(req.body, nativeLogin)
    .then(() => {
      db.general.findOneWithAttributes(tables.users, {
        userName: req.body.userName,
        password: req.body.password
      }).then((user) => {
        if (user) {
          req.user = user;
          next();
        } else {
          respond.nonexistentCredentials(res);
        }
      }).catch((error) => {
        respond.internalServerError(error, res);
      });
    })
    .catch(() => {
      respond.validateRequestBody(req.body, facebookLogin)
        .then(() => {
          facebook.checkCredentials(req.body)
          .then((fUser) => {
            db.general.findOneWithAttributes(tables.users, {
              facebook_id: fUser.id
            }).then((user) => {
              if (user) {
                req.user = user;
                next();
              } else {
                db.general.createNewEntry(tables.users, {
                  facebook_id: fUser.id,
                  userName: fUser.name,
                  password: "customFbPw",
                  firstName: fUser.name,
                  lastName: fUser.name,
                  email: fUser.email,
                  country: fUser.location.name,
                  birthdate: fUser.birthday
                }).then((newUser) => {
                  req.user = newUser[0];
                  next();
                }).catch((error) => {
                  respond.internalServerError(error, res);
                });
              }
            })

          });
        })
        .catch((error) => respond.invalidRequestBodyError(error, res));
    });
};

module.exports = loginRouter;

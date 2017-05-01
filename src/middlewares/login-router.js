const respond = require('../handlers/response');
const facebook = require('../handlers/auth/facebook');

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
      req.nativeLogin = true;
      next();
    })
    .catch(() => {
      respond.validateRequestBody(req.body, facebookLogin)
        .then(() => {
          req.facebookLogin = true;
          facebook.checkCredentials(req.body)
          .then(() => next());
        })
        .catch(error => respond.invalidRequestBodyError(error, res));
    });
};

module.exports = loginRouter;

const logger = require('../../utils/logger');
const passport = require('./jwt');
const respond = require('../response');

// strategies = array of strings
const authenticate = (req, res, next, strategies) => {
  logger.info('===== Check');
  passport.authenticate(strategies, (err, user, info) => {
    if (err) {
      respond.internalServerError(err, res);
    } else if (info) {
      const message = `Unauthorized: ${info[0].message}`;
      logger.warn(message);
      res.status(401).json({ code: 401, message: message });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

const jwtAuthenticate = (req, res, next) => {
  authenticate(req, res, next, ['jwt']);
};

module.exports = jwtAuthenticate;

const logger = require('../../utils/logger');
const passport = require('./jwt');
const respond = require('../response');

const jwtAuthenticate = (req, res, next) => {
  authenticate(req, res, next, ['jwt']);
};

// strategies = array of strings
// 
const authenticate = (req, res, next, strategies) => {
	logger.info('===== Check');
  passport.authenticate(strategies, (err, user, info) => {
    if (err) {
      respond.internalServerError(err, res);
    } else if (info) {
      logger.warn(`Unauthorized: ${JSON.stringify(info, null, 4)}`);
      res.status(400).json({ message: info });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

    // logger.info(`Err: ${JSON.stringify(err, null, 4)}`);
    // logger.info(`User: ${JSON.stringify(user, null, 4)}`);
    // logger.info(`Info: ${JSON.stringify(info, null, 4)}`);
module.exports = jwtAuthenticate;
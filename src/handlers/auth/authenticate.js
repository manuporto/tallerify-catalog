const passport = require('./jwt');
const respond = require('../response');

// strategies = array of strings
const authenticate = (req, res, next, strategies) => {
  passport.authenticate(strategies, (err, user, info) => {
    if (err) {
      respond.internalServerError(err, res);
    } else if (info) {
      respond.unauthorizedError(info[0].message, res);
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

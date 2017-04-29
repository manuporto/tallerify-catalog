const logger = require('../../utils/logger');
const passport = require('passport');
const db = require('../db/');
const tables = require('../../database/tableNames');
const passportJwt = require('passport-jwt');
const config = require('../../config');

const JwtStrategy = passportJwt.Strategy;
const extractJwt = passportJwt.ExtractJwt;

const options = {
  jwtFromRequest: extractJwt.fromAuthHeader(),
  secretOrKey: config.secret,
  session: false,
};

// not sure what this is 1j1j1j1
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new JwtStrategy(options, (jwtPayload, done) => {
  logger.info(`Payload: ${JSON.stringify(jwtPayload, null, 4)}`);
  if (jwtPayload) {
    done(null, jwtPayload);
  } else {
    done(null, false, {message: 'Unexpected error'});
  }
}));

module.exports = passport;
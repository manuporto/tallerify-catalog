const logger = require('../../utils/logger');
const passport = require('passport');
const db = require('../db/');
const tables = require('../../database/tableNames');
const LocalStrategy = require('passport-local').Strategy;

const options = {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  };

passport.use(new LocalStrategy(options, (req, username, password, done) => {
  logger.info(`Username: ${username}`);
  logger.info(`Password: ${password}`);
  // check to see if the username exists
  db.findWithUsernameAndPassword(tables.admins, username, password).first()
  .then(admin => {
    if (!admin) {
    	return done(null, false)
    } else {
      return done(null, user);
    }
  })
  .catch((err) => { return done(err); });
}));

module.exports = passport;
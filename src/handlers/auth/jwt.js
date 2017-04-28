const passport = require('passport');
const db = require('../db/');
const tables = require('../../database/tableNames');
const passportJwt = require("passport-jwt");

const JwtStrategy = passportJwt.Strategy;
const extractJwt = passportJwt.ExtractJwt;

const options = {jwtFromRequest: extractJwt.fromAuthHeader(), secretOrKey: 'piensapiensa'};

passport.use(new JwtStrategy(options, (payload, next) => {
	const user = db.findWithUsernameAndPassword(tables.users, payload.username, payload.password);
	if (user) {
		next(null, user);
	} else {
		next(null, false);
	}
}));

module.exports = passport;
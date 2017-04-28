const logger = require('../../utils/logger');
const passport = require('passport');
const db = require('../db/');
const tables = require('../../database/tableNames');
const passportJwt = require("passport-jwt");
const config = require('../../config');

const JwtStrategy = passportJwt.Strategy;
const extractJwt = passportJwt.ExtractJwt;

const options = {jwtFromRequest: extractJwt.fromAuthHeader(), secretOrKey: config.secret};

passport.use(new JwtStrategy(options, (jwt_payload, next) => {
	logger.info(`Payload: ${JSON.stringify(jwt_payload, null, 4)}`);
	db.findWithUsernameAndPassword(tables.admins, jwt_payload.username, jwt_payload.password)
	.then(admin => {
		if (admin) {
			logger.info('Success');
			next(null, admin);
		} else {
			logger.info('Failure');
			next(null, false, { message: 'kb gato' });
		}
	});
}));

module.exports = passport;
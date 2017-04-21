const env = process.env.NODE_ENV || 'development';

const logger = require('../utils/logger');
const config = require('./knexfile.js');   
const db = require('knex')(config[env]);

if(process.env.NODE_ENV != 'test') {
  logger.info('Running migrations.');
	db.migrate.latest([config]); 
	logger.info('Migrations ran.');
};

module.exports = db;

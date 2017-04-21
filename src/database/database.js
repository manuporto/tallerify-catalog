const env = process.env.NODE_ENV || 'development';

const config = require('./knexfile.js');
const db = require('knex')(config[env]);

db.migrate.latest([config]);

module.exports = db;

const logger = require('../../utils/logger');
const tables = require('../tableNames');

exports.up = (knex, Promise) => {
	return Promise.all([
		knex.schema.createTableIfNotExists(tables.tracks, table => {
			logger.info('Creating tracks table.');
			table.increments('id').primary();
			table.string('name');
			table.integer('duration')
		}),

		knex.schema.createTableIfNotExists(tables.artists, table => {
			logger.info('Creating artists table.');
			table.increments('id').primary();
			table.string('name');
			table.integer('popularity');
		}),

		knex.schema.createTableIfNotExists(tables.artists_tracks, table => {
			logger.info('Creating artists_tracks table.');
			table.increments('artist_track_id').primary();
			table.integer('artist_id');
			table.integer('track_id');
		})
   ]);
};

exports.down = (knex, Promise) => {
	return Promise.all([
		knex.schema.dropTable(tables.tracks),
		knex.schema.dropTable(tables.artists),
		knex.schema.dropTable(tables.artists_tracks),
   ]);
};
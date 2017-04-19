exports.up = (knex, Promise) => {
	return Promise.all([
		knex.schema.createTable('tracks', table => {
			table.increments('id').primary();
			table.string('name');
			table.integer('duration')
		}),

		knex.schema.createTable('artists', table => {
			table.increments('id').primary();
			table.string('name');
			table.integer('popularity');
		}),

		knex.schema.createTable('tracks_artists', table => {
			table.increments('track_artist_id').primary();
			table.integer('track_id');
			table.integer('artist_id');
		})
	]);
};

exports.down = (knex, Promise) => {
	return Promise.all([
		knex.schema.dropTable('tracks');
		knex.schema.dropTable('artists');
		knex.schema.dropTable('tracks_artists');
	]);
};
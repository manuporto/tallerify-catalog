const tables = require('../tableNames');

exports.up = (knex, Promise) => {
	return Promise.all([
		knex.schema.createTable(tables.users, table => {
			table.increments('id').primary();
			table.string('userName');
			table.string('password');
			table.string('firstName');
			table.string('lastName');
			table.string('country');
			table.string('email');
			table.specificType('images', 'text ARRAY');
		})
	]);
};

exports.down = (knex, Promise) => {
	return Promise.all([
		knex.schema.dropTable(tables.users)
	]);
};
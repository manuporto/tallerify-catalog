module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname+"/migrations",
      tableName: 'knex_migrations'
    }
  },
  test: {
    client: 'postgresql',
    connection: 'postgres://postgres:postgres@localhost:5432/tallerify_test2',
    migrations: {
      directory: __dirname+"/migrations",
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname+"/migrations",
      tableName: 'knex_migrations'
    }
  }

};

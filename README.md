# tallerify-catalog-server
[![Build Status](https://travis-ci.org/tallerify/tallerify-catalog.svg?branch=develop)](https://travis-ci.org/tallerify/tallerify-catalog)
[![Coverage Status](https://coveralls.io/repos/github/tallerify/tallerify-catalog/badge.svg?branch=develop)](https://coveralls.io/github/tallerify/tallerify-catalog?branch=develop)

## Installation

### With Docker and Docker Compose
1. Install [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Run `$ docker-compose up --build`
3. Go to `http://localhost:3000/`

### Without Docker

#### Install depenencies
1. Install postgres:
  * `$ sudo apt-get update`
  * `$ sudo apt-get install postgresql postgresql-contrib`
2. Create database (replace dbname with used database):
  * `$ psql -U postgres -h localhost`
  * `$ postgres=# CREATE DATABASE dbname;`
3. Install the node packages via:
  * `$ npm install`
4. Create database table:
  * `$ ./node_modules/.bin/sequelize db:migrate`
  
#### Start
To start the application (server and client) run:

* `npm start`

#### Test
For running the test suit run:

* `npm test`

## Documentation
 * [App Documentation](https://github.com/tallerify/tallerify-catalog/wiki)
 * [Api Specification](http://rebilly.github.io/ReDoc/?url=https://raw.githubusercontent.com/tallerify/tallerify-catalog/develop/docs/tallerify-catalog-api.yaml)

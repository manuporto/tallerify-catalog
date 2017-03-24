# tallerify-catalog-server
[![Build Status](https://travis-ci.org/manuporto/tallerify-catalog.svg?branch=develop)](https://travis-ci.org/manuporto/tallerify-catalog)
[![Coverage Status](https://coveralls.io/repos/github/tallerify/tallerify-catalog/badge.svg?branch=develop)](https://coveralls.io/github/tallerify/tallerify-catalog?branch=develop)

## Install
1. Install postgres:
  * `$ sudo apt-get update`
  * `$ sudo apt-get install postgresql postgresql-contrib`
2. Create database (replace dbname with used database):
  * `psql -U postgres -h localhost`
  * `postgres=# CREATE DATABASE dbname;`
3. Install the node packages via:
  * `$ npm install`
4. Create database table:
  * `node server/models/database.js`
  
## Start
To start the server run:

* `npm start`

To start the client app run:

* `ng serve`

## Test
For running the test suit run:

* `npm test`

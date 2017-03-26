'use strict';
const winston = require('winston');
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config.json')[env];
var db        = {};

winston.log('info', 'Connecting to database');
if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}
winston.log('info', 'Connected to database');

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

winston.log('info', 'Associating models');
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    winston.log('info', `Associating "${modelName}" model`);
    db[modelName].associate(db);
    db[modelName].sync();
  }
});
winston.log('info', 'Finished associating models');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

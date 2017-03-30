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

Object.keys(db).forEach(function(modelName) {
  winston.log('info', `Syncing ${modelName} model`);
  db[modelName].sync(db);
  if (db[modelName].associate) {
    winston.log('info', `Associating "${modelName}" model`);
    db[modelName].associate(db);
  }
});
winston.log('info', 'Finished associating models');


/* Models/tables */
db.album = require('../models/album.js')(sequelize, Sequelize);
db.artist = require('../models/artist.js')(sequelize, Sequelize);
db.track = require('../models/track.js')(sequelize, Sequelize);
db.user = require('../models/track.js')(sequelize, Sequelize);

/* Relations */
db.album.hasMany(db.track);
db.album.belongsToMany(db.artist, {through: 'ArtistAlbum'});
db.artist.belongsToMany(db.album, {through: 'ArtistAlbum'});
db.track.belongsTo(db.album);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

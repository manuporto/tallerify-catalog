'use strict';
const winston = require('winston');

module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('albums', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER,
    release_date: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(db) {
        winston.log('info', Object.keys(db));
        db.albums.belongsToMany(db.artists, {through: 'ArtistAlbum'});
      }
    }
  }, {
    timestamp: false
  });
  return Album;
};

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
    timestamps: false
  }, {
    classMethods: {
      associate: function(db) {
        winston.log('info', Object.keys(db));
        db.albums.belongsToMany(db.artists, {through: 'ArtistAlbum'});
      }
    }
  });
  return Album;
};

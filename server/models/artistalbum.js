'use strict';
module.exports = function(sequelize, DataTypes) {
  var ArtistAlbum = sequelize.define('ArtistAlbum', {
    artistId: DataTypes.INTEGER,
    albumId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ArtistAlbum;
};
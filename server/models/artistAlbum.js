'use strict';
module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('artistsAlbums', {
    artistId: DataTypes.INTEGER,
    albumId: DataTypes.INTEGER
  }, {
    timestamps: false
  }, {
    classMethods: {
      associate: function(db) {}
    }
  });
  return Album;
};

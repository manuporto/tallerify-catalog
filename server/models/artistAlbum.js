'use strict';
module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('artistsAlbums', {
    artistId: DataTypes.INTEGER,
    albumId: DataTypes.INTEGER
  }, {
    timestamps: false
  }, {
    classMethods: {
      associate: function(db) {
        db.artistsAlbums.belongsTo(db.artists);
        db.artistsAlbums.belongsTo(db.albums);
      }
    }
  });
  return Album;
};

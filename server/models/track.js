'use strict';
module.exports = function(sequelize, DataTypes) {
  var Track = sequelize.define('Track', {
    AlbumId: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    href: DataTypes.STRING,
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        //Track.hasMany(models.Artist);
        Track.belongsTo(models.Album);
      }
    }
  });
  return Track;
};

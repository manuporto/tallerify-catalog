'use strict';
module.exports = function(sequelize, DataTypes) {
  var Track = sequelize.define('Track', {
    album: DataTypes.INTEGER,
    artists: DataTypes.ARRAY(DataTypes.INTEGER),
    duration: DataTypes.INTEGER,
    href: DataTypes.STRING,
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Track.belongsTo(models.Album);
        Track.hasMany(models.Artist);
      }
    }
  });
  return Track;
};

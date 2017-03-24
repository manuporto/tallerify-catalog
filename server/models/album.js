'use strict';
module.exports = function(sequelize, DataTypes) {
  var Album = sequelize.define('Album', {
    artists: DataTypes.ARRAY(DataTypes.INTEGER),
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER,
    release_date: DataTypes.STRING,
    tracks: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    classMethods: {
      associate: function(models) {
        Album.hasMany(models.Track);
        Album.hasMany(models.Artist);
      }
    }
  });
  return Album;
};

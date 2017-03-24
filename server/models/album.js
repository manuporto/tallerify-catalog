'use strict';
module.exports = function(sequelize, DataTypes) {
  var Album = sequelize.define('Album', {
    artists: DataTypes.ARRAY(Sequelize.INTEGER),
    genres: DataTypes.ARRAY(Sequelize.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(Sequelize.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER,
    release_date: DataTypes.STRING,
    tracks: DataTypes.ARRAY(Sequelize.INTEGER)
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

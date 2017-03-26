'use strict';
module.exports = function(sequelize, DataTypes) {
  var Album = sequelize.define('Album', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER,
    release_date: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Album.belongsToMany(models.Artist, {through: 'ArtistAlbum'});
        Album.hasMany(models.Track);
      }
    }
  });
  return Album;
};

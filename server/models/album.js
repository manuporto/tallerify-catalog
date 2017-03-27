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
        Album.hasMany(models.Track);
        Album.belongsToMany(models.Artist, {through: models.ArtistAlbum, foreignKey: 'artistId'});
      }
    }
  });
  return Album;
};

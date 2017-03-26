'use strict';
module.exports = function(sequelize, DataTypes) {
  var Artist = sequelize.define('Artist', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Artist.belongsToMany(models.Album, {through: 'ArtistAlbum'});
      }
    }
  });
  return Artist;
};

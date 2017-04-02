'use strict';
module.exports = (sequelize, DataTypes) => {
  const Artist = sequelize.define('artists', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    timestamps: false
  }, {
    classMethods: {
      associate: function(db) {
        db.artists.belongsToMany(db.albums, {through: db.artistsAlbums});
      }
    }
  });
  return Artist;
};

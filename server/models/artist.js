'use strict';
module.exports = (sequelize, DataTypes) => {
  const Artist = sequelize.define('artists', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    timestamp: false
  });
  return Artist;
};

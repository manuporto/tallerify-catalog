'use strict';
module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('albums', {
    genres: DataTypes.ARRAY(DataTypes.STRING),
    href: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER,
    release_date: DataTypes.STRING
  }, {
    timestamp: false
  });
  return Album;
};

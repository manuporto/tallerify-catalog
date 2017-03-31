'use strict';
module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define('tracks', {
    AlbumId: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    href: DataTypes.STRING,
    name: DataTypes.STRING,
    popularity: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(db) {
      }
    }
  }, {
    timestamp: false
  });
  return Track;
};

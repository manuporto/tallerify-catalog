'use strict';
module.exports = function(sequelize, DataTypes) {
  var Track = sequelize.define('Track', {
    albumId: DataTypes.INTEGER,
    artists: DataTypes.ARRAY(DataTypes.INTEGER),
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Track;
};

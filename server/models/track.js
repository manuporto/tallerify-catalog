'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Track', {
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
};

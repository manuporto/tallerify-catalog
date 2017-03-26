'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    href: DataTypes.STRING,
    userName: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    birthdate: { type: DataTypes.STRING, allowNull: false },
    images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
    contacts: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};


module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admins', {
    userName: { type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      } },
    password: { type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      } },
    firstName: { type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      } },
    lastName: { type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      } },
    email: { type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      } },
  }, {
    timestamps: false,
  }, {
    classMethods: {
      associate(db) {
        // Associations
      },
    },
  });
  return Admin;
};

'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Tracks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AlbumId: {
        type: Sequelize.INTEGER
      },
      duration: {
        type: Sequelize.INTEGER
      },
      href: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      popularity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Tracks');
  }
};

'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('semester', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      sem_id: {
		allowNull: false,
		primaryKey: true,
        type: Sequelize.STRING(3)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('semester');
  }
};
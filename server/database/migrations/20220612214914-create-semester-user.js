'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('semester_user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id:{
		type: Sequelize.INTEGER,
		references:{
			model: {tableName:'user'},
			key: 'id'
		}
	  },
	  sem_id:{
		type: Sequelize.STRING(3),
		references:{
			model: {tableName:'semester'},
			key: 'sem_id'
		}
	  },
      is_ta: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('semester_user');
  }
};
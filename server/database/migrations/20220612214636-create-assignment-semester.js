'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignment_semester', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assignmentId:{
		type: Sequelize.INTEGER,
		references:{
			model: {tableName: 'assignment'},
			key: 'id'
		}
	  },
	  semesterId:{
		type: Sequelize.STRING(3),
		references:{
			model: {tableName: 'semester'},
			key: 'sem_id'
		}
	  },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('assignment_semester');
  }
};
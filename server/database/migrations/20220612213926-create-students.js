'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      student_id:{
		type: Sequelize.INTEGER,
		primaryKey:true,
		allowNull: false,
		references:{
			model: {tableName: 'users'},
			key: 'id'
		}
	  },
      num_questions: {
        type: Sequelize.BIGINT
      },
      time_on_queue: {
        type: Sequelize.BIGINT
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
    await queryInterface.dropTable('students');
  }
};
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
	  student_id:{
		type: Sequelize.INTEGER,
		references:{
			model: {tableName: 'student'},
			key: 'student_id'
		}
	  },
	  ta_id:{
		type: Sequelize.INTEGER,
		references:{
			model: {tableName: 'ta'},
			key: 'ta_id'
		}
	  },
	  sem_id:{
		type: Sequelize.STRING,
		references:{
			model: {tableName: 'semester'},
			key: 'sem_id'
		}
	  },
      question: {
        type: Sequelize.TEXT
      },
      attempted: {
        type: Sequelize.TEXT
      },
      location: {
        type: Sequelize.STRING
      },
      assignment: {
        type: Sequelize.STRING
      },
      entry_time: {
        type: Sequelize.DATE
      },
      help_time: {
        type: Sequelize.DATE
      },
      exit_time: {
        type: Sequelize.DATE
      },
      fixed: {
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
    await queryInterface.dropTable('question');
  }
};
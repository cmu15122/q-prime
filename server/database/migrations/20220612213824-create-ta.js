'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      ta_id:{
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		references:{
			model: {tableName: 'user'},
			key: 'id'
		}
	},
      is_admin: {
        type: Sequelize.INTEGER
      },
      zoom_url: {
        type: Sequelize.STRING
      },
      num_helped: {
        type: Sequelize.BIGINT
      },
      time_helped: {
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
    await queryInterface.dropTable('ta');
  }
};
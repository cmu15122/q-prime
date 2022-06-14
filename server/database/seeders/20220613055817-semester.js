'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert(
		'semester', [
			{
				sem_id: 'F19',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				sem_id: 'S19',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				sem_id: 'F20',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
	await queryInterface.bulkDelete('semester', null, {});
  }
};

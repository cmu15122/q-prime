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
		'assignment', [{
	  		name: 'Scavhunt',
	  		category: 'Programming',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			name: 'Pixels',
			category: 'Programming',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			name: 'Written 12',
			category: 'Written',
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
	await queryInterface.bulkDelete('assignment', null, {});
  }
};

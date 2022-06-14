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
    await queryInterface.bulkInsert('user', [
		{
			email: 'jd@gmail.com',
			fname: 'John',
			lname: 'Doe',
			access_token: 'asdf',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			email: 'honk@gmail.com',
			fname: 'Honk',
			lname: 'Honk',
			access_token: 'honk',
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
	await queryInterface.bulkDelete('user', null, {});
  }
};

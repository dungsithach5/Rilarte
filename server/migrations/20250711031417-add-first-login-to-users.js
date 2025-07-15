'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'firstLogin', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'firstLogin');


    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

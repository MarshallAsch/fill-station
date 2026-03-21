'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('settings', {
			key: {
				type: Sequelize.STRING,
				primaryKey: true,
			},
			value: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('settings')
	},
}

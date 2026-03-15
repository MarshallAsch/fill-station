'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Contacts', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			message: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM('submited', 'responded', 'closed', 'spam'),
				defaultValue: 'submited',
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('Contacts')
	},
}

'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Maintenance', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			type: {
				type: Sequelize.ENUM(
					'start',
					'air-test',
					'general',
					'filter-change',
					'oil-change',
					'unknown',
				),
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			hours: {
				type: Sequelize.FLOAT(10, 2),
				allowNull: false,
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
		await queryInterface.dropTable('Maintenance')
	},
}

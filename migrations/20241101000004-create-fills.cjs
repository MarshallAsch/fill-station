'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Fills', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			CylinderId: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Cylinders',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
			date: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: Sequelize.fn('now'),
			},
			startPressure: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			endPressure: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			oxygen: {
				type: Sequelize.FLOAT(5, 2),
				allowNull: false,
				defaultValue: 20.9,
			},
			helium: {
				type: Sequelize.FLOAT(5, 2),
				allowNull: false,
				defaultValue: 0.0,
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
		await queryInterface.dropTable('Fills')
	},
}

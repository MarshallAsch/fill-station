'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Cylinders', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			ownerId: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Clients',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
			serialNumber: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			material: {
				type: Sequelize.ENUM('undefined', 'steel', 'aluminum', 'composite'),
				allowNull: false,
				defaultValue: 'undefined',
			},
			birth: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			lastHydro: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			lastVis: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			servicePressure: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 3000,
			},
			oxygenClean: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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
		await queryInterface.dropTable('Cylinders')
	},
}

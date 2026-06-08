'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Cylinders', 'pairedCylinderId', {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: null,
			references: { model: 'Cylinders', key: 'id' },
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('Cylinders', 'pairedCylinderId')
	},
}

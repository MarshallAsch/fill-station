'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Cylinders', 'nickname', {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
		})
		await queryInterface.addColumn('Cylinders', 'manufacturer', {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
		})
		await queryInterface.addColumn('Cylinders', 'size', {
			type: Sequelize.FLOAT,
			allowNull: true,
			defaultValue: null,
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('Cylinders', 'size')
		await queryInterface.removeColumn('Cylinders', 'manufacturer')
		await queryInterface.removeColumn('Cylinders', 'nickname')
	},
}

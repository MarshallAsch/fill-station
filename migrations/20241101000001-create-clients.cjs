'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Clients', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			nitroxCert: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			advancedNitroxCert: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			trimixCert: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			inspectionCert: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
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
		await queryInterface.dropTable('Clients')
	},
}

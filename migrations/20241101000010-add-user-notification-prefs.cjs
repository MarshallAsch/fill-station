'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'notify_contact', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'notify_hydro', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'notify_visual', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'hydro_reminder_days1', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 180,
		})
		await queryInterface.addColumn('users', 'hydro_reminder_days2', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 30,
		})
		await queryInterface.addColumn('users', 'visual_reminder_days1', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 60,
		})
		await queryInterface.addColumn('users', 'visual_reminder_days2', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 30,
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('users', 'notify_contact')
		await queryInterface.removeColumn('users', 'notify_hydro')
		await queryInterface.removeColumn('users', 'notify_visual')
		await queryInterface.removeColumn('users', 'hydro_reminder_days1')
		await queryInterface.removeColumn('users', 'hydro_reminder_days2')
		await queryInterface.removeColumn('users', 'visual_reminder_days1')
		await queryInterface.removeColumn('users', 'visual_reminder_days2')
	},
}

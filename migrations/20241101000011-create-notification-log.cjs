'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notification_logs', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: 'users', key: 'id' },
				onDelete: 'CASCADE',
			},
			type: {
				type: Sequelize.ENUM('hydro_reminder', 'visual_reminder'),
				allowNull: false,
			},
			cylinder_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Cylinders', key: 'id' },
				onDelete: 'CASCADE',
			},
			reminder_days: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			sent_at: {
				type: Sequelize.DATEONLY,
				allowNull: false,
			},
		})

		await queryInterface.addIndex(
			'notification_logs',
			['user_id', 'type', 'cylinder_id', 'reminder_days', 'sent_at'],
			{ name: 'notification_logs_dedup_idx' },
		)
	},

	async down(queryInterface) {
		await queryInterface.dropTable('notification_logs')
	},
}

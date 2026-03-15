'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('audit_logs', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			action: {
				type: Sequelize.ENUM('create', 'update', 'delete'),
				allowNull: false,
			},
			entity: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			entity_id: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			details: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('now'),
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('audit_logs')
	},
}

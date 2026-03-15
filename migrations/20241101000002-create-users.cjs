'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: 'email',
			},
			email_verified: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			image: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			theme: {
				type: Sequelize.ENUM('light', 'dark', 'system'),
				allowNull: false,
				defaultValue: 'system',
			},
			role: {
				type: Sequelize.ENUM('user', 'admin', 'filler', 'inspector'),
				allowNull: false,
				defaultValue: 'user',
			},
			client_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: true,
				defaultValue: null,
				references: {
					model: 'Clients',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('users')
	},
}

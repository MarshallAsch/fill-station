'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('accounts', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			provider: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			provider_account_id: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			refresh_token: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			access_token: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			expires_at: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			token_type: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			scope: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			id_token: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			session_state: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
		})

		await queryInterface.createTable('sessions', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			expires: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			session_token: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: 'session_token',
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
		})

		await queryInterface.createTable('verification_tokens', {
			token: {
				type: Sequelize.STRING,
				primaryKey: true,
			},
			identifier: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			expires: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('verification_tokens')
		await queryInterface.dropTable('sessions')
		await queryInterface.dropTable('accounts')
	},
}

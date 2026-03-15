'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Visuals', {
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
			inspectorId: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Clients',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT',
			},
			valve: {
				type: Sequelize.ENUM('din', 'yoke', 'h', 'none'),
				allowNull: false,
				defaultValue: 'din',
			},
			heat: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			painted: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			odor: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			bow: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			bulges: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			bell: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			lineCorrosion: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			exteriorDescription: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			exteriorMarks: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			externalStandards: {
				type: Sequelize.ENUM('acceptable', 'marginal', 'fail'),
				allowNull: false,
				defaultValue: 'acceptable',
			},
			internalContents: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			internalDescription: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			internalMarks: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			internalStandards: {
				type: Sequelize.ENUM('acceptable', 'marginal', 'fail'),
				allowNull: false,
				defaultValue: 'acceptable',
			},
			threadingDescription: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: '',
			},
			badThreadCount: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			threadingStandards: {
				type: Sequelize.ENUM('acceptable', 'marginal', 'fail'),
				allowNull: false,
				defaultValue: 'acceptable',
			},
			burstDiskReplaced: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			oringReplaced: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			dipTube: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			needService: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			rebuilt: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			status: {
				type: Sequelize.ENUM('acceptable', 'marginal', 'fail'),
				allowNull: false,
				defaultValue: 'acceptable',
			},
			date: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			oxygenCleaned: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			markedOxygenClean: {
				type: Sequelize.BOOLEAN,
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
		await queryInterface.dropTable('Visuals')
	},
}

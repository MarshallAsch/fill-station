import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	database: 'fills',
	username: 'fills',
	password: 'fills',
})

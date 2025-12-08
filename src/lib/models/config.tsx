import { Sequelize } from 'sequelize'
import nconf from '../config'


export const sequelize = new Sequelize({
	dialect: 'mariadb',
	host: nconf.get('database:host'),
	database: nconf.get('database:database'),
	username: nconf.get('database:username'),
	password: nconf.get('database:password'),
})

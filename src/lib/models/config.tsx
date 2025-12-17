import { Sequelize } from 'sequelize'
import nconf from '../config'
import mariadb from 'mariadb'
// needed to get the dependancy to be loaded
console.log(mariadb.version)

export const sequelize = new Sequelize({
	dialect: 'mariadb',
	host: nconf.get('database:host'),
	database: nconf.get('database:database'),
	username: nconf.get('database:username'),
	password: nconf.get('database:password'),
})

module.exports = {
	development: {
		dialect: 'mariadb',
		host: process.env.DATABASE__HOST || 'localhost',
		database: process.env.DATABASE__DATABASE || 'fills',
		username: process.env.DATABASE__USERNAME || 'fills',
		password: process.env.DATABASE__PASSWORD || 'fills',
	},
	production: {
		dialect: 'mariadb',
		host: process.env.DATABASE__HOST || 'localhost',
		database: process.env.DATABASE__DATABASE || 'fills',
		username: process.env.DATABASE__USERNAME || 'fills',
		password: process.env.DATABASE__PASSWORD || 'fills',
	},
}

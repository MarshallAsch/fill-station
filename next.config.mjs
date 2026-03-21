import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	serverExternalPackages: [
		'sequelize',
		'mariadb',
		'js-yaml',
		'nconf',
		'nconf-esm',
	],
	turbopack: {},
}

export default withPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
})(nextConfig)

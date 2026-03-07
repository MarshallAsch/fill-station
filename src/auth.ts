import NextAuth from 'next-auth'
import SequelizeAdapter from '@auth/sequelize-adapter'
import { sequelize } from './lib/models/config'

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		{
			id: 'authelia',
			name: 'Marshalls Lab',
			type: 'oidc',
			issuer: 'https://home.marshallasch.ca/authelia',
			clientId: process.env.AUTH_CLIENT_ID,
			clientSecret: process.env.AUTH_CLIENT_SECRET,
			checks: ['pkce', 'state'],
			style: {
				logo: 'https://www.authelia.com/images/branding/logo-cropped.png',
			},
		},
	],
	adapter: SequelizeAdapter(sequelize),
})

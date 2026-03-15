import NextAuth from 'next-auth'
import SequelizeAdapter from '@auth/sequelize-adapter'
import { sequelize } from './lib/models/config'
import { User } from './lib/models/user'

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		{
			id: 'authelia',
			name: 'Marshalls Lab',
			type: 'oidc',
			issuer: 'https://home.marshallasch.ca/authelia',
			wellKnown:
				'https://home.marshallasch.ca/authelia/.well-known/openid-configuration',
			clientId: process.env.AUTH_CLIENT_ID,
			clientSecret: process.env.AUTH_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
			idToken: false,
			checks: ['pkce', 'state'],
			style: {
				logo: 'https://www.authelia.com/images/branding/logo-cropped.png',
			},
		},
	],
	adapter: SequelizeAdapter(sequelize, {
		models: { User: User as any },
	}),
	callbacks: {
		async session({ session, user }) {
			const dbUser = await User.findByPk(user.id)
			if (session.user && dbUser) {
				session.user.role = dbUser.role
			}
			return session
		},
	},
	events: {
		async signIn({ user }) {
			if (user.id) {
				await User.update({ lastLogin: new Date() }, { where: { id: user.id } })
			}
		},
	},
	pages: {
		signIn: '/',
	},
})

sequelize.sync({ alter: true })

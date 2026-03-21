import NextAuth from 'next-auth'
import SequelizeAdapter from '@auth/sequelize-adapter'
import { models as adapterModels } from '@auth/sequelize-adapter'
import { DataTypes } from 'sequelize'
import { sequelize } from './lib/models/config'
import { User } from './lib/models/user'
import { sendEmail } from './lib/email/transport'
import { welcomeEmail } from './lib/email/templates'
import GoogleProvider from 'next-auth/providers/google'

// Override the default Account model to use TEXT for token columns.
// Google returns tokens that exceed VARCHAR(255).
const Account = sequelize.define(
	'account',
	{
		...adapterModels.Account,
		access_token: { type: DataTypes.TEXT },
		refresh_token: { type: DataTypes.TEXT },
	},
	{ underscored: true, timestamps: false },
)

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		{
			id: 'authelia',
			name: 'Marshalls Lab',
			type: 'oidc',
			issuer: 'https://home.marshallasch.ca/authelia',
			wellKnown:
				'https://home.marshallasch.ca/authelia/.well-known/openid-configuration',
			clientId: process.env.AUTH_AUTHELIA_CLIENT_ID,
			clientSecret: process.env.AUTH_AUTHELIA_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
			idToken: false,
			checks: ['pkce', 'state'],
			style: {
				logo: 'https://www.authelia.com/images/branding/logo-cropped.png',
			},
		},
		GoogleProvider({
			clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
			clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),
	],
	adapter: SequelizeAdapter(sequelize, {
		synchronize: false,
		models: { User: User as any, Account: Account as any },
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
		async createUser({ user }) {
			if (user.email && user.name) {
				sendEmail(
					user.email,
					'Welcome to Fill Station',
					welcomeEmail(user.name),
				).catch((err) => console.error('Failed to send welcome email:', err))
			}
		},
	},
	pages: {
		signIn: '/',
	},
})

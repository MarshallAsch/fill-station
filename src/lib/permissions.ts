// src/lib/permissions.ts
// Note: The 'user' role has no API access except /api/profile PUT.
// User-role data access (dashboard) is done server-side via Sequelize + scopeQuery,
// not through API routes.

import { auth } from '@/auth'
import { Session } from 'next-auth'
import { User } from '@/lib/models/user'
import { Cylinder } from '@/lib/models/cylinder'
import { FindOptions, Includeable } from 'sequelize'

export type Role = 'user' | 'admin' | 'filler' | 'inspector'

export const PERMISSIONS = {
	pages: {
		'/dashboard': ['user', 'filler', 'inspector', 'admin'] as Role[],
		'/profile': ['user', 'filler', 'inspector', 'admin'] as Role[],
		'/fills': ['filler', 'inspector', 'admin'] as Role[],
		'/visual': ['filler', 'inspector', 'admin'] as Role[],
		'/clients': ['filler', 'inspector', 'admin'] as Role[],
		'/history': ['filler', 'inspector', 'admin'] as Role[],
		'/settings': ['admin'] as Role[],
	},
	api: {
		'/api/fills': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
		'/api/clients': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
		'/api/clients/:clientId': { GET: ['filler', 'inspector', 'admin'], PUT: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
		'/api/clients/:clientId/cylinders': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
		'/api/cylinders': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
		'/api/cylinders/:cylinderId': { PUT: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
		'/api/cylinders/:cylinderId/fills': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
		'/api/cylinders/:cylinderId/visuals': { GET: ['filler', 'inspector', 'admin'], POST: ['inspector', 'admin'], DELETE: ['admin'] },
		'/api/visuals': { GET: ['filler', 'inspector', 'admin'] },
		'/api/inspectors': { GET: ['filler', 'inspector', 'admin'] },
		'/api/maintenance': { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
		'/api/maintenance/last': { GET: ['filler', 'inspector', 'admin'] },
		'/api/users': { GET: ['admin'] },
		'/api/users/:userId': { PUT: ['admin'] },
		'/api/profile': { PUT: ['user', 'filler', 'inspector', 'admin'] },
		'/api/contact': { GET: ['admin'] },
	} as Record<string, Partial<Record<string, Role[]>>>,
}

export async function requireRole(roles: Role[]): Promise<Response | Session> {
	const session = await auth()
	if (!session?.user) {
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)
	}
	const userRole = (session.user.role ?? 'user') as Role
	if (!roles.includes(userRole)) {
		return Response.json(
			{ error: 'forbidden', message: 'Insufficient permissions' },
			{ status: 403 },
		)
	}
	return session
}

// Type guard to check if requireRole returned an error Response
export function isErrorResponse(result: Response | Session): result is Response {
	return result instanceof Response
}

const allNavItems = [
	{ name: 'Profile', href: '/profile' },
	{ name: 'Dashboard', href: '/dashboard' },
	{ name: 'Fills', href: '/fills' },
	{ name: 'Visual', href: '/visual' },
	{ name: 'History', href: '/history' },
	{ name: 'Clients', href: '/clients' },
	{ name: 'Settings', href: '/settings' },
]

export function getNavItems(role: Role) {
	return allNavItems.filter((item) => {
		const allowedRoles = PERMISSIONS.pages[item.href as keyof typeof PERMISSIONS.pages]
		return allowedRoles?.includes(role)
	})
}

// Sorted patterns by specificity (longest first) for matching
const apiPatterns = Object.keys(PERMISSIONS.api).sort(
	(a, b) => b.split('/').length - a.split('/').length,
)

export function matchApiRoute(
	pathname: string,
	method: string,
): Role[] | null {
	for (const pattern of apiPatterns) {
		const patternParts = pattern.split('/')
		const pathParts = pathname.split('/')

		if (patternParts.length !== pathParts.length) continue

		const matches = patternParts.every(
			(part, i) => part.startsWith(':') || part === pathParts[i],
		)

		if (matches) {
			const methods = PERMISSIONS.api[pattern]
			return (methods as Record<string, Role[]>)[method] ?? null
		}
	}
	return null
}

type ScopeEntity = 'client' | 'cylinder' | 'fill' | 'visual'

export function scopeQuery(
	user: User,
	entity: ScopeEntity,
	options: FindOptions = {},
): FindOptions | Response {
	// Non-user roles get unscoped access
	if (user.role !== 'user') return options

	// User role requires a linked client
	if (!user.clientId) {
		return Response.json(
			{
				error: 'no_client',
				message: 'No linked client. Contact the shop to link your account.',
			},
			{ status: 403 },
		)
	}

	const clientId = user.clientId

	switch (entity) {
		case 'client':
			return {
				...options,
				where: { ...((options.where as object) ?? {}), id: clientId },
			}
		case 'cylinder':
			return {
				...options,
				where: { ...((options.where as object) ?? {}), ownerId: clientId },
			}
		case 'fill':
		case 'visual': {
			// Merge ownerId filter into existing Cylinder include if present,
			// otherwise append a new one. Avoids duplicate Cylinder joins.
			const existingIncludes = ((options.include as Includeable[]) ?? []).slice()
			const cylIdx = existingIncludes.findIndex(
				(inc) => typeof inc === 'object' && 'model' in inc && inc.model === Cylinder,
			)
			if (cylIdx >= 0) {
				const existing = existingIncludes[cylIdx] as Record<string, unknown>
				existingIncludes[cylIdx] = {
					...existing,
					where: { ...((existing.where as object) ?? {}), ownerId: clientId },
				}
			} else {
				existingIncludes.push({
					model: Cylinder,
					where: { ownerId: clientId },
					attributes: [],
				})
			}
			return { ...options, include: existingIncludes }
		}
	}
}

// src/lib/permissions-server.ts
// Server-only permission helpers that depend on Sequelize models.
// Import from here in API routes and server components.
// For client-safe exports (Role, PERMISSIONS, getNavItems), use permissions.ts.

import { auth } from '@/auth'
import { Session } from 'next-auth'
import { User } from '@/lib/models/user'
import { Cylinder } from '@/lib/models/cylinder'
import { FindOptions, Includeable } from 'sequelize'
import { Role } from './permissions'

export { Role } from './permissions'

export async function requireRole(
	roles: Role[],
): Promise<Response | Session> {
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
export function isErrorResponse(
	result: Response | Session,
): result is Response {
	return result instanceof Response
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
				message:
					'No linked client. Contact the shop to link your account.',
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
				where: {
					...((options.where as object) ?? {}),
					ownerId: clientId,
				},
			}
		case 'fill':
		case 'visual': {
			// Merge ownerId filter into existing Cylinder include if present,
			// otherwise append a new one. Avoids duplicate Cylinder joins.
			const existingIncludes = (
				(options.include as Includeable[]) ?? []
			).slice()
			const cylIdx = existingIncludes.findIndex(
				(inc) =>
					typeof inc === 'object' &&
					'model' in inc &&
					inc.model === Cylinder,
			)
			if (cylIdx >= 0) {
				const existing = existingIncludes[cylIdx] as Record<
					string,
					unknown
				>
				existingIncludes[cylIdx] = {
					...existing,
					where: {
						...((existing.where as object) ?? {}),
						ownerId: clientId,
					},
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

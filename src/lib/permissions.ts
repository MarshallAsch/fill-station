// src/lib/permissions.ts
// Client-safe permissions config — no server-only imports.
// Server-only helpers (requireRole, scopeQuery) are in permissions-server.ts.

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
		const allowedRoles =
			PERMISSIONS.pages[item.href as keyof typeof PERMISSIONS.pages]
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

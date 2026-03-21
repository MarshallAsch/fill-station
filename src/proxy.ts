import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { PERMISSIONS, matchApiRoute, Role } from '@/lib/permissions'

// Pages that don't require authentication
const publicPages = ['/', '/api/auth', '/about', '/contact']

function isPublicFile(pathname: string): boolean {
	// Static files in public folder
	const staticFileExtensions =
		/\.(png|jpg|jpeg|svg|ico|webp|webmanifest|json)$/i
	if (staticFileExtensions.test(pathname)) return true

	// Specific known public files
	if (pathname === '/favicon.ico') return true
	if (pathname.startsWith('/apple-icon')) return true
	if (pathname.startsWith('/web-app-manifest-')) return true
	if (pathname.startsWith('/icon')) return true

	return false
}

function isPublicApiRoute(pathname: string, method: string): boolean {
	if (pathname.startsWith('/api/auth')) return true
	if (pathname === '/api/contact' && method === 'POST') return true
	if (pathname === '/api/seed' && process.env.NODE_ENV === 'development')
		return true
	return false
}

export default auth((req) => {
	const { pathname } = req.nextUrl
	const method = req.method

	console.log({ pathname, method })

	// Public static files — serve directly without auth
	if (isPublicFile(pathname)) {
		return NextResponse.next()
	}

	// Public pages — no auth required
	if (publicPages.some((p) => pathname === p)) {
		return NextResponse.next()
	}

	// Public API routes — no auth required
	if (isPublicApiRoute(pathname, method)) {
		return NextResponse.next()
	}

	// Require authentication for everything else
	if (!req.auth?.user) {
		if (pathname.startsWith('/api/')) {
			return NextResponse.json(
				{ error: 'auth', message: 'Must be logged in' },
				{ status: 401 },
			)
		}
		const url = req.nextUrl.clone()
		url.pathname = '/'
		url.searchParams.set('redirected', 'true')
		return NextResponse.redirect(url)
	}

	const role = (req.auth.user.role ?? 'user') as Role

	// Page route role check
	if (!pathname.startsWith('/api/')) {
		const basePath = '/' + pathname.split('/')[1]
		const allowedRoles =
			PERMISSIONS.pages[basePath as keyof typeof PERMISSIONS.pages]

		if (allowedRoles && !allowedRoles.includes(role)) {
			const url = req.nextUrl.clone()
			url.pathname = '/'
			return NextResponse.redirect(url)
		}

		return NextResponse.next()
	}

	// API route role + method check
	const allowedRoles = matchApiRoute(pathname, method)
	if (allowedRoles === null) {
		// Unmatched API route — deny by default
		return NextResponse.json(
			{ error: 'forbidden', message: 'Insufficient permissions' },
			{ status: 403 },
		)
	}

	if (!allowedRoles.includes(role)) {
		return NextResponse.json(
			{ error: 'forbidden', message: 'Insufficient permissions' },
			{ status: 403 },
		)
	}

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

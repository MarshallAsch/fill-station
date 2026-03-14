import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

// Pages that don't require authentication
const publicPages = ['/', '/api/auth', '/about', '/contact']

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check if the page is public
	const isPublicPage =
		publicPages.some(
			(page) => pathname === page || pathname.startsWith(page + '/'),
		) || pathname.startsWith('/api/auth')

	// If it's a public page, allow access
	if (isPublicPage) {
		return NextResponse.next()
	}

	// For protected pages, use auth to check session
	const session = await auth()

	// If no session, redirect to homepage with redirect flag
	if (!session) {
		const redirectUrl = new URL('/', request.url)
		redirectUrl.searchParams.set('redirected', 'true')
		return NextResponse.redirect(redirectUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

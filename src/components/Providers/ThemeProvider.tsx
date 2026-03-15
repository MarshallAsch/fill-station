'use client'

import { ReactNode, useEffect } from 'react'
import { Theme } from '@/types/profile'

function applyTheme(theme: Theme) {
	const root = document.documentElement
	if (theme === 'system') {
		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)',
		).matches
		root.classList.toggle('dark', prefersDark)
	} else {
		root.classList.toggle('dark', theme === 'dark')
	}
}

const ThemeProvider = ({
	initialTheme,
	children,
}: {
	initialTheme: Theme
	children: ReactNode
}) => {
	useEffect(() => {
		applyTheme(initialTheme)
	}, [initialTheme])

	useEffect(() => {
		if (initialTheme !== 'system') return

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => applyTheme('system')
		mediaQuery.addEventListener('change', handler)
		return () => mediaQuery.removeEventListener('change', handler)
	}, [initialTheme])

	return <>{children}</>
}

export { applyTheme }
export default ThemeProvider

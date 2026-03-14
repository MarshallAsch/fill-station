'use client'

import { useEffect, useState } from 'react'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { updateTheme } from '@/app/_api'
import { Theme } from '@/types/profile'
import { toast } from 'react-toastify'

const themeOptions = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' },
]

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

interface ThemeSettingsProps {
	initialTheme: Theme
}

const ThemeSettings = ({ initialTheme }: ThemeSettingsProps) => {
	const [theme, setTheme] = useState<Theme>(initialTheme)

	useEffect(() => {
		applyTheme(theme)
	}, [theme])

	useEffect(() => {
		if (theme !== 'system') return

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => applyTheme('system')
		mediaQuery.addEventListener('change', handler)
		return () => mediaQuery.removeEventListener('change', handler)
	}, [theme])

	const handleChange = async (value: string) => {
		const newTheme = value as Theme
		setTheme(newTheme)
		applyTheme(newTheme)

		const data = await updateTheme(newTheme)
		if (typeof data !== 'string') {
			toast.success('Theme updated')
		} else {
			toast.error(`Failed to save theme: ${data}`)
		}
	}

	return (
		<div className='w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
			<RadioGroup
				title='Theme'
				name='theme'
				options={themeOptions}
				value={theme}
				onChange={handleChange}
			/>
		</div>
	)
}

export default ThemeSettings

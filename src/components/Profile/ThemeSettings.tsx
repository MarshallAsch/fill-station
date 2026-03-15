'use client'

import { useState } from 'react'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { updateTheme } from '@/app/_api'
import { Theme } from '@/types/profile'
import { toast } from 'react-toastify'
import { applyTheme } from '@/components/Providers/ThemeProvider'

const themeOptions = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' },
]

interface ThemeSettingsProps {
	initialTheme: Theme
}

const ThemeSettings = ({ initialTheme }: ThemeSettingsProps) => {
	const [theme, setTheme] = useState<Theme>(initialTheme)

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
		<div className='dark:border-border border-border bg-background w-full max-w-md rounded-lg border p-6 shadow-sm dark:bg-gray-800'>
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

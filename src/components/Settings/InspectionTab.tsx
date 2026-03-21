'use client'

import axios from 'axios'
import { useState } from 'react'
import { toast } from 'react-toastify'

import Button from '@/components/UI/Button'
import ListBox from '@/components/UI/FormElements/ListBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { AppSettings } from '@/types/settings'

type InspectionTabProps = {
	settings: AppSettings
	inspectors: { id: string; name: string | null }[]
}

function formatLocalPreview(hour: number, minute: number): string {
	const date = new Date()
	date.setUTCHours(hour, minute, 0, 0)
	return date.toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short',
	})
}

const InspectionTab = ({ settings, inspectors }: InspectionTabProps) => {
	const [defaultInspectorId, setDefaultInspectorId] = useState<string | null>(
		settings.defaultInspectorId,
	)
	const [cronHour, setCronHour] = useState(settings.cronHour)
	const [cronMinute, setCronMinute] = useState(settings.cronMinute)
	const [defaultHydroReminder1, setDefaultHydroReminder1] = useState(
		settings.defaultHydroReminder1,
	)
	const [defaultHydroReminder2, setDefaultHydroReminder2] = useState(
		settings.defaultHydroReminder2,
	)
	const [defaultVisualReminder1, setDefaultVisualReminder1] = useState(
		settings.defaultVisualReminder1,
	)
	const [defaultVisualReminder2, setDefaultVisualReminder2] = useState(
		settings.defaultVisualReminder2,
	)
	const [saving, setSaving] = useState(false)

	const inspectorItems = [
		{ name: 'None', value: '' },
		...inspectors.map((u) => ({ name: u.name ?? u.id, value: u.id })),
	]

	const defaultInspectorItem =
		inspectorItems.find((i) => i.value === (defaultInspectorId ?? '')) ??
		inspectorItems[0]

	const handleSave = async () => {
		const current: Partial<AppSettings> = {
			defaultInspectorId: defaultInspectorId,
			cronHour,
			cronMinute,
			defaultHydroReminder1,
			defaultHydroReminder2,
			defaultVisualReminder1,
			defaultVisualReminder2,
		}

		const diff: Partial<AppSettings> = {}
		for (const key of Object.keys(current) as (keyof typeof current)[]) {
			if (current[key] !== settings[key]) {
				;(diff as any)[key] = current[key]
			}
		}

		if (Object.keys(diff).length === 0) {
			toast.success('No changes to save')
			return
		}

		setSaving(true)
		try {
			await axios.patch('/api/settings', diff)
			toast.success('Settings saved')
		} catch {
			toast.error('Failed to save settings')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='w-full max-w-2xl space-y-8'>
			<div>
				<h2 className='text-text text-xl font-semibold'>
					Inspection & Maintenance
				</h2>
				<p className='text-muted-text mt-1 text-sm'>
					Configure inspection defaults and notification schedule.
				</p>
			</div>

			{/* Default Inspector */}
			<div className='space-y-1'>
				<ListBox
					id='defaultInspectorId'
					name='defaultInspectorId'
					title='Default Inspector'
					items={inspectorItems}
					defaultValue={defaultInspectorItem}
					onChange={(item) =>
						setDefaultInspectorId(item.value === '' ? null : item.value)
					}
				/>
			</div>

			{/* Notification Schedule */}
			<div className='space-y-3'>
				<h3 className='text-text text-base font-medium'>
					Notification Schedule
				</h3>
				<div className='flex items-end gap-3'>
					<div className='w-28'>
						<NumberInput
							id='cronHour'
							name='cronHour'
							label='Hour (0–23)'
							value={cronHour}
							onChange={(v) => setCronHour(Math.min(23, Math.max(0, v)))}
						/>
					</div>
					<div className='w-28'>
						<NumberInput
							id='cronMinute'
							name='cronMinute'
							label='Minute (0–59)'
							value={cronMinute}
							onChange={(v) => setCronMinute(Math.min(59, Math.max(0, v)))}
						/>
					</div>
					<span className='text-muted-text pb-2 text-sm'>UTC</span>
				</div>
				<p className='text-muted-text text-sm'>
					Local time:{' '}
					<span className='text-text font-medium'>
						{String(cronHour).padStart(2, '0')}:
						{String(cronMinute).padStart(2, '0')} UTC (
						{formatLocalPreview(cronHour, cronMinute)})
					</span>
				</p>
			</div>

			{/* Default Reminder Days */}
			<div className='space-y-3'>
				<h3 className='text-text text-base font-medium'>
					Default Reminder Days (for new users)
				</h3>
				<div className='grid grid-cols-2 gap-4'>
					<NumberInput
						id='defaultHydroReminder1'
						name='defaultHydroReminder1'
						label='Hydro Reminder 1 (days)'
						value={defaultHydroReminder1}
						onChange={setDefaultHydroReminder1}
					/>
					<NumberInput
						id='defaultHydroReminder2'
						name='defaultHydroReminder2'
						label='Hydro Reminder 2 (days)'
						value={defaultHydroReminder2}
						onChange={setDefaultHydroReminder2}
					/>
					<NumberInput
						id='defaultVisualReminder1'
						name='defaultVisualReminder1'
						label='Visual Reminder 1 (days)'
						value={defaultVisualReminder1}
						onChange={setDefaultVisualReminder1}
					/>
					<NumberInput
						id='defaultVisualReminder2'
						name='defaultVisualReminder2'
						label='Visual Reminder 2 (days)'
						value={defaultVisualReminder2}
						onChange={setDefaultVisualReminder2}
					/>
				</div>
			</div>

			{/* Save */}
			<div className='max-w-xs'>
				<Button onClick={handleSave} disabled={saving}>
					{saving ? 'Saving…' : 'Save Changes'}
				</Button>
			</div>
		</div>
	)
}

export default InspectionTab

'use client'

import axios from 'axios'
import { useState } from 'react'
import { toast } from 'react-toastify'

import Button from '@/components/UI/Button'
import ListBox from '@/components/UI/FormElements/ListBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { AppSettings } from '@/types/settings'

type CylindersTabProps = {
	settings: AppSettings
}

const CylindersTab = ({ settings }: CylindersTabProps) => {
	const [defaultServicePressure, setDefaultServicePressure] = useState(
		settings.defaultServicePressure,
	)
	const [allowedServicePressures, setAllowedServicePressures] = useState(
		[...settings.allowedServicePressures].sort((a, b) => a - b),
	)
	const [showAddInput, setShowAddInput] = useState(false)
	const [newPressure, setNewPressure] = useState(0)
	const [saving, setSaving] = useState(false)

	const pressureItems = allowedServicePressures.map((p) => ({
		name: `${p} psi`,
		value: String(p),
	}))

	const defaultPressureItem =
		pressureItems.find((i) => i.value === String(defaultServicePressure)) ??
		pressureItems[0]

	const removeChip = (pressure: number) => {
		if (pressure === defaultServicePressure) {
			toast.error('Cannot remove the current default pressure')
			return
		}
		if (allowedServicePressures.length <= 1) {
			toast.error('At least one allowed pressure is required')
			return
		}
		setAllowedServicePressures((prev) => prev.filter((p) => p !== pressure))
	}

	const handleAddPressure = () => {
		if (!newPressure || newPressure <= 0 || !Number.isInteger(newPressure)) {
			toast.error('Pressure must be a positive integer')
			return
		}
		if (allowedServicePressures.includes(newPressure)) {
			toast.error('That pressure is already in the list')
			return
		}
		setAllowedServicePressures((prev) =>
			[...prev, newPressure].sort((a, b) => a - b),
		)
		setNewPressure(0)
		setShowAddInput(false)
	}

	const handleSave = async () => {
		const diff: Partial<AppSettings> = {}

		if (defaultServicePressure !== settings.defaultServicePressure) {
			diff.defaultServicePressure = defaultServicePressure
		}

		const sortedOriginal = [...settings.allowedServicePressures].sort(
			(a, b) => a - b,
		)
		const pressuresChanged =
			allowedServicePressures.length !== sortedOriginal.length ||
			allowedServicePressures.some((p, i) => p !== sortedOriginal[i])

		if (pressuresChanged) {
			diff.allowedServicePressures = allowedServicePressures
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
				<h2 className='text-text text-xl font-semibold'>Cylinder Defaults</h2>
				<p className='text-muted-text mt-1 text-sm'>
					Configure default service pressure and allowed pressure values.
				</p>
			</div>

			{/* Default Service Pressure */}
			<div className='space-y-1'>
				<ListBox
					id='defaultServicePressure'
					name='defaultServicePressure'
					title='Default Service Pressure'
					items={pressureItems}
					defaultValue={defaultPressureItem}
					onChange={(item) => setDefaultServicePressure(Number(item.value))}
				/>
			</div>

			{/* Allowed Service Pressures */}
			<div className='space-y-3'>
				<h3 className='text-text text-base font-medium'>
					Allowed Service Pressures
				</h3>
				<div className='flex flex-wrap gap-2'>
					{allowedServicePressures.map((pressure) => (
						<span
							key={pressure}
							className='border-border bg-surface text-text inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm'
						>
							{pressure} psi
							<button
								onClick={() => removeChip(pressure)}
								className='text-muted-text hover:text-text ml-1'
								aria-label={`Remove ${pressure} psi`}
							>
								✕
							</button>
						</span>
					))}

					{!showAddInput && (
						<button
							onClick={() => setShowAddInput(true)}
							className='border-border text-muted-text hover:text-text inline-flex items-center rounded-full border border-dashed px-3 py-1 text-sm'
						>
							+ Add
						</button>
					)}
				</div>

				{showAddInput && (
					<div className='flex items-center gap-2'>
						<div className='w-50'>
							<NumberInput
								id='newPressure'
								name='newPressure'
								value={newPressure}
								onChange={setNewPressure}
								placeholder='e.g. 3442'
							/>
						</div>
						<Button onClick={handleAddPressure}>Add</Button>
						<Button
							variant='ghost'
							onClick={() => {
								setShowAddInput(false)
								setNewPressure(0)
							}}
						>
							Cancel
						</Button>
					</div>
				)}
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

export default CylindersTab

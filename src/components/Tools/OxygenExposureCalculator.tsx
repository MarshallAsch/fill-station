'use client'

import { useEffect, useRef, useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { computeDay, DayItem } from '@/lib/diveMath/oxygenExposure'
import { ataAtDepth, Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

interface DiveRow {
	depth: number
	fo2: number
	minutes: number
	surfaceAfter: number
}

const OxygenExposureCalculator = () => {
	const { units } = useUnits()
	const [water, setWater] = useState<Water>('salt')
	const [rows, setRows] = useState<DiveRow[]>([
		{ depth: 30, fo2: 32, minutes: 40, surfaceAfter: 60 },
	])
	const prevDepthUnit = useRef(units.depth)
	useEffect(() => {
		const from = prevDepthUnit.current
		if (from !== units.depth) {
			prevDepthUnit.current = units.depth
			setRows((prev) =>
				prev.map((r) => ({
					...r,
					depth: Math.round(fromMeters(toMeters(r.depth, from), units.depth)),
				})),
			)
		}
	}, [units.depth])

	const update = (i: number, key: keyof DiveRow, value: number) =>
		setRows((prev) =>
			prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)),
		)
	const addRow = () =>
		setRows((prev) => [
			...prev,
			{ depth: 30, fo2: 32, minutes: 40, surfaceAfter: 60 },
		])
	const removeRow = (i: number) =>
		setRows((prev) => prev.filter((_, idx) => idx !== i))

	const items: DayItem[] = []
	rows.forEach((r, i) => {
		const ppo2 =
			(r.fo2 / 100) * ataAtDepth(toMeters(r.depth, units.depth), water)
		items.push({ type: 'dive', ppo2, minutes: r.minutes })
		if (i < rows.length - 1)
			items.push({ type: 'surface', minutes: r.surfaceAfter })
	})
	const result = computeDay(items)

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<RadioGroup
				title='Water'
				name='ox-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='space-y-4'>
				{rows.map((r, i) => (
					<div
						key={i}
						className='border-border space-y-3 rounded-md border p-3'
					>
						<div className='flex items-center justify-between'>
							<h3 className='text-text font-semibold'>Dive {i + 1}</h3>
							<button
								type='button'
								onClick={() => removeRow(i)}
								disabled={rows.length === 1}
								className='text-light-text hover:text-text text-sm disabled:opacity-40'
							>
								Remove
							</button>
						</div>
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
							<NumberInput
								id={`ox-d-${i}`}
								name={`ox-d-${i}`}
								label={`Depth (${units.depth})`}
								value={r.depth}
								onChange={(v) => update(i, 'depth', v)}
							/>
							<NumberInput
								id={`ox-o2-${i}`}
								name={`ox-o2-${i}`}
								label='O₂ (%)'
								value={r.fo2}
								onChange={(v) => update(i, 'fo2', v)}
							/>
							<NumberInput
								id={`ox-t-${i}`}
								name={`ox-t-${i}`}
								label='Time (min)'
								value={r.minutes}
								onChange={(v) => update(i, 'minutes', v)}
							/>
							{i < rows.length - 1 && (
								<NumberInput
									id={`ox-si-${i}`}
									name={`ox-si-${i}`}
									label='Surface interval (min)'
									value={r.surfaceAfter}
									onChange={(v) => update(i, 'surfaceAfter', v)}
								/>
							)}
						</div>
						<p className='text-light-text text-sm'>
							CNS {result.perDive[i]?.cnsPercent.toFixed(1) ?? '0'}% · OTU{' '}
							{Math.round(result.perDive[i]?.otu ?? 0)}
						</p>
					</div>
				))}
				<button
					type='button'
					onClick={addRow}
					className='bg-accent text-white-text rounded-md px-3 py-2 text-sm font-medium'
				>
					Add dive
				</button>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Day totals</h2>
				<p className='text-text'>
					Peak CNS:{' '}
					<span className='font-semibold'>
						{result.peakCnsPercent.toFixed(1)}%
					</span>
				</p>
				<p className='text-text'>
					End-of-day CNS:{' '}
					<span className='font-semibold'>
						{result.endCnsPercent.toFixed(1)}%
					</span>
				</p>
				<p className='text-text'>
					Total OTU:{' '}
					<span className='font-semibold'>{Math.round(result.totalOtu)}</span>
				</p>
			</section>
		</div>
	)
}

export default OxygenExposureCalculator

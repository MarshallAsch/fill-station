'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	diveGasRequirement,
	minGasPressure,
	rmv,
	rockBottom,
} from '@/lib/diveMath/gasPlanning'
import { Water } from '@/lib/diveMath/modEnd'
import { fromBar, fromLiters, toBar, toMeters } from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
import { useUnits } from './UnitsProvider'
import { useDepthState, usePressureState } from './useUnitState'

const GasRequirementsCalculator = () => {
	const { units } = useUnits()
	const [water, setWater] = useState<Water>('salt')
	const [tankVol, setTankVol] = useState(11.1)
	// SAC inputs
	const [startP, setStartP] = usePressureState(200)
	const [endP, setEndP] = usePressureState(100)
	const [logMinutes, setLogMinutes] = useState(20)
	const [logDepth, setLogDepth] = useDepthState(100)
	// Plan inputs
	const [planDepth, setPlanDepth] = useDepthState(100)
	const [planMinutes, setPlanMinutes] = useState(20)
	const [ascentRate, setAscentRate] = useDepthState(30)
	const [stopDepth, setStopDepth] = useDepthState(15)
	const [stopMinutes, setStopMinutes] = useState(3)
	const [stress, setStress] = useState(2)
	const [team, setTeam] = useState(2)

	const tankVolumeL = tankVol
	const rmvLpm = rmv({
		startP: toBar(startP, units.pressure),
		endP: toBar(endP, units.pressure),
		minutes: logMinutes,
		avgDepthM: toMeters(logDepth, units.depth),
		tankVolumeL,
		water,
	})
	const planAvgM = toMeters(planDepth, units.depth)
	const diveGasL = diveGasRequirement({
		rmvLpm,
		avgDepthM: planAvgM,
		minutes: planMinutes,
		water,
	})
	const minGasL = rockBottom({
		rmvLpm,
		depthM: planAvgM,
		ascentRateMpm: toMeters(ascentRate, units.depth),
		stops: [{ depthM: toMeters(stopDepth, units.depth), minutes: stopMinutes }],
		stressFactor: stress,
		water,
		teamSize: team,
	})
	const minGasBar = minGasPressure({ minGasL, tankVolumeL })

	return (
		<div className='space-y-6'>
			<RadioGroup
				title='Water'
				name='gr-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>
					1 · SAC / RMV from a logged dive
				</h2>
				<TankSizePicker category='dive' onSelect={(l) => setTankVol(l)} />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='gr-tank'
						name='gr-tank'
						label='Tank volume (L)'
						value={tankVol}
						onChange={setTankVol}
						tooltip='Water (internal) cylinder volume — not free-gas capacity'
						min={0}
					/>
					<NumberInput
						id='gr-start'
						name='gr-start'
						label={`Start (${units.pressure})`}
						value={startP}
						onChange={setStartP}
						min={0}
					/>
					<NumberInput
						id='gr-end'
						name='gr-end'
						label={`End (${units.pressure})`}
						value={endP}
						onChange={setEndP}
						min={0}
					/>
					<NumberInput
						id='gr-min'
						name='gr-min'
						label='Time (min)'
						value={logMinutes}
						onChange={setLogMinutes}
						min={0}
					/>
					<NumberInput
						id='gr-ldepth'
						name='gr-ldepth'
						label={`Avg depth (${units.depth})`}
						value={logDepth}
						onChange={setLogDepth}
						min={0}
					/>
				</div>
				<div className='border-border space-y-2 rounded-md border p-4'>
					<p className='text-text'>
						RMV:{' '}
						<span className='font-semibold'>{rmvLpm.toFixed(1)} L/min</span>
					</p>
				</div>
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>
					2 · Plan &amp; rock bottom
				</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='gr-pdepth'
						name='gr-pdepth'
						label={`Avg depth (${units.depth})`}
						value={planDepth}
						onChange={setPlanDepth}
						min={0}
					/>
					<NumberInput
						id='gr-pmin'
						name='gr-pmin'
						label='Bottom time (min)'
						value={planMinutes}
						onChange={setPlanMinutes}
						min={0}
					/>
					<NumberInput
						id='gr-arate'
						name='gr-arate'
						label={`Ascent rate (${units.depth}/min)`}
						value={ascentRate}
						onChange={setAscentRate}
						min={0}
					/>
					<NumberInput
						id='gr-sdepth'
						name='gr-sdepth'
						label={`Stop depth (${units.depth})`}
						value={stopDepth}
						onChange={setStopDepth}
						min={0}
					/>
					<NumberInput
						id='gr-smin'
						name='gr-smin'
						label='Stop time (min)'
						value={stopMinutes}
						onChange={setStopMinutes}
						min={0}
					/>
					<NumberInput
						id='gr-stress'
						name='gr-stress'
						label='Stress factor'
						value={stress}
						onChange={setStress}
						min={1}
					/>
					<NumberInput
						id='gr-team'
						name='gr-team'
						label='Team size'
						value={team}
						onChange={setTeam}
						min={1}
					/>
				</div>
			</section>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Results</h2>
				<p className='text-text'>
					Dive gas needed:{' '}
					<span className='font-semibold'>
						{Math.round(fromLiters(diveGasL, units.volume))} {units.volume}{' '}
						(surface)
					</span>
				</p>
				<p className='text-text'>
					Rock bottom (min gas):{' '}
					<span className='font-semibold'>
						{Number.isFinite(minGasBar)
							? Math.round(fromBar(minGasBar, units.pressure))
							: '—'}{' '}
						{units.pressure}
					</span>
				</p>
			</section>
		</div>
	)
}

export default GasRequirementsCalculator

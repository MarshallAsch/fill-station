'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { roundPressure, roundSac, roundVolume } from '@/lib/diveMath/format'
import {
	diveGasRequirement,
	minGasPressure,
	rmv,
	rockBottom,
} from '@/lib/diveMath/gasPlanning'
import { Water } from '@/lib/diveMath/modEnd'
import { toLiters, toBar, toMeters } from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
import { useUnits } from './UnitsProvider'
import { usePersistedDepth, usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'

const GasRequirementsCalculator = () => {
	const { units } = useUnits()
	const [water, setWater] = usePersistedState<Water>('gr.water', 'salt')
	const [tankVol, setTankVol] = usePersistedState('gr.tankVol', 11.1)
	// SAC mode
	const [sacMode, setSacMode] = usePersistedState<'dive' | 'direct'>(
		'gr.sacMode',
		'dive',
	)
	const [directRmv, setDirectRmv] = usePersistedState('gr.directRmv', 14)
	// SAC inputs
	const [startP, setStartP] = usePersistedPressure('gr.startP', 200)
	const [endP, setEndP] = usePersistedPressure('gr.endP', 100)
	const [logMinutes, setLogMinutes] = usePersistedState('gr.logMinutes', 20)
	const [logDepth, setLogDepth] = usePersistedDepth('gr.logDepth', 100)
	// Plan inputs
	const [planDepth, setPlanDepth] = usePersistedDepth('gr.planDepth', 100)
	const [planMinutes, setPlanMinutes] = usePersistedState('gr.planMinutes', 20)
	const [ascentRate, setAscentRate] = usePersistedDepth('gr.ascentRate', 30)
	const [stopDepth, setStopDepth] = usePersistedDepth('gr.stopDepth', 15)
	const [stopMinutes, setStopMinutes] = usePersistedState('gr.stopMinutes', 3)
	const [stress, setStress] = usePersistedState('gr.stress', 2)
	const [team, setTeam] = usePersistedState('gr.team', 2)

	const tankVolumeL = tankVol
	const rmvLpm =
		sacMode === 'direct'
			? toLiters(directRmv, units.volume)
			: rmv({
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
				<RadioGroup
					title='SAC source'
					name='gr-sacmode'
					value={sacMode}
					onChange={(v) => setSacMode(v as 'dive' | 'direct')}
					options={[
						{ value: 'dive', label: 'From a logged dive' },
						{ value: 'direct', label: 'Enter SAC/RMV directly' },
					]}
				/>
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
					{sacMode === 'direct' ? (
						<NumberInput
							id='gr-direct-rmv'
							name='gr-direct-rmv'
							label={`SAC/RMV (${units.volume}/min)`}
							value={directRmv}
							onChange={setDirectRmv}
							min={0}
						/>
					) : (
						<>
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
						</>
					)}
				</div>
				<div className='border-border space-y-2 rounded-md border p-4'>
					<p className='text-text'>
						RMV:{' '}
						<span className='font-semibold'>
							{roundSac(rmvLpm, units.volume)} {units.volume}/min
						</span>
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
						tooltip='Multiplies your breathing rate (RMV) for the emergency ascent only — e.g. 2 = breathing twice as fast under stress. Affects the rock-bottom reserve, not the planned-dive gas.'
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
						{roundVolume(diveGasL, units.volume)} {units.volume} (surface)
					</span>
				</p>
				<p className='text-text'>
					Rock bottom (min gas):{' '}
					<span className='font-semibold'>
						{Number.isFinite(minGasBar)
							? roundPressure(minGasBar, units.pressure)
							: '—'}{' '}
						{units.pressure}
					</span>
				</p>
			</section>
		</div>
	)
}

export default GasRequirementsCalculator

'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { boosterFillProfile, calculateBooster } from '@/lib/diveMath/booster'
import { fromBar, fromLiters, toBar, toLpm } from '@/lib/diveMath/units'
import BoosterChart, { ChartSeries } from './BoosterChart'
import BoosterPicker from './BoosterPicker'
import SafetyNote from './SafetyNote'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { usePressureState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const BoosterCalculator = () => {
	const { units } = useUnits()
	const [ratio, setRatio] = useState(30)
	const [driveP, setDriveP] = usePressureState(150)
	const [supplyVol, setSupplyVol] = useState(50)
	const [supplyStart, setSupplyStart] = usePressureState(2900)
	const [receiverVol, setReceiverVol] = useState(11.1)
	const [receiverStart, setReceiverStart] = usePressureState(500)
	const [target, setTarget] = usePressureState(3000)
	const [driveRate, setDriveRate] = useState(0)

	const input = {
		ratio,
		driveP: toBar(driveP, units.pressure),
		supplyVol,
		supplyStart: toBar(supplyStart, units.pressure),
		receiverVol,
		receiverStart: toBar(receiverStart, units.pressure),
		target: toBar(target, units.pressure),
	}
	const result = calculateBooster(input)
	const profile = boosterFillProfile(input, 40)

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const vol = (l: number) => Math.round(fromLiters(l, units.volume))
	const driveRateLpm = toLpm(driveRate, units.airFlow)
	const fillMinutes =
		driveRate > 0 && result.driveAirL > 0
			? result.driveAirL / driveRateLpm
			: null

	const chartSeries: ChartSeries[] = profile.length
		? [
				{
					label: 'Cumulative drive air',
					colorClass: 'text-accent',
					values: profile.map((pt) =>
						fromLiters(pt.cumulativeDriveL, units.volume),
					),
					rangeLabel: `${vol(profile[0].cumulativeDriveL)}→${vol(profile[profile.length - 1].cumulativeDriveL)} ${units.volume}`,
				},
				{
					label: 'Supply pressure',
					colorClass: 'text-light-text',
					values: profile.map((pt) => fromBar(pt.supplyP, units.pressure)),
					rangeLabel: `${p(profile[0].supplyP)}→${p(profile[profile.length - 1].supplyP)} ${units.pressure}`,
				},
				{
					label: 'Drive-air rate',
					colorClass: 'text-warning',
					values: profile.map((pt) => pt.rateLPerBar),
					rangeLabel: `${Math.round(profile[0].rateLPerBar)}→${Math.round(profile[profile.length - 1].rateLPerBar)} L/bar`,
				},
			]
		: []
	const xLabels = profile.length
		? [
				`${p(profile[0].receiverP)} ${units.pressure}`,
				`${p(profile[Math.floor(profile.length / 2)].receiverP)}`,
				`${p(profile[profile.length - 1].receiverP)} ${units.pressure}`,
			]
		: []

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume', 'airFlow']} />

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Booster</h2>
				<BoosterPicker onSelect={setRatio} />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='b-ratio'
						name='b-ratio'
						label='Area ratio (n:1)'
						value={ratio}
						onChange={setRatio}
						min={1}
					/>
					<NumberInput
						id='b-drive'
						name='b-drive'
						label={`Drive pressure (${units.pressure})`}
						value={driveP}
						onChange={setDriveP}
						min={0}
					/>
				</div>
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Supply cylinder</h2>
				<TankSizePicker
					category='industrial'
					onSelect={(l) => setSupplyVol(l)}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='b-svol'
						name='b-svol'
						label='Supply volume (L)'
						value={supplyVol}
						onChange={setSupplyVol}
						min={0}
						tooltip='Water (internal) cylinder volume — not free-gas capacity'
					/>
					<NumberInput
						id='b-sstart'
						name='b-sstart'
						label={`Supply start (${units.pressure})`}
						value={supplyStart}
						onChange={setSupplyStart}
						min={0}
					/>
				</div>
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Receiver cylinder</h2>
				<TankSizePicker
					category='dive'
					onSelect={(l, bar) => {
						setReceiverVol(l)
						setTarget(fromBar(bar, units.pressure))
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='b-rvol'
						name='b-rvol'
						label='Receiver volume (L)'
						value={receiverVol}
						onChange={setReceiverVol}
						min={0}
						tooltip='Water (internal) cylinder volume — not free-gas capacity'
					/>
					<NumberInput
						id='b-rstart'
						name='b-rstart'
						label={`Receiver start (${units.pressure})`}
						value={receiverStart}
						onChange={setReceiverStart}
						min={0}
					/>
					<NumberInput
						id='b-target'
						name='b-target'
						label={`Target (${units.pressure})`}
						value={target}
						onChange={setTarget}
						min={0}
					/>
					<NumberInput
						id='b-driverate'
						name='b-driverate'
						label={`Drive-air supply rate (${units.airFlow}, optional)`}
						value={driveRate}
						onChange={setDriveRate}
						min={0}
					/>
				</div>
			</section>

			{!result.feasible && result.reason && (
				<SafetyNote level='danger'>
					{result.reason}
					{result.supplyLimitedMax !== undefined &&
						` Reachable max ≈ ${p(result.supplyLimitedMax)} ${units.pressure}.`}
				</SafetyNote>
			)}
			{result.feasible && result.driveAirL === 0 && (
				<SafetyNote level='warning'>
					Free equalization already reaches the target — no boosting needed.
				</SafetyNote>
			)}

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Estimate</h2>
				<p className='text-text'>
					Max output pressure:{' '}
					<span className='font-semibold'>
						{p(result.maxOutput)} {units.pressure}
					</span>
				</p>
				<p className='text-text'>
					Equalization pressure:{' '}
					<span className='font-semibold'>
						{p(result.eqPressure)} {units.pressure}
					</span>
				</p>
				<p className='text-text'>
					Drive air consumed:{' '}
					<span className='font-semibold'>
						{vol(result.driveAirL)} {units.volume}
					</span>
				</p>
				<p className='text-text'>
					Final supply pressure:{' '}
					<span className='font-semibold'>
						{p(result.finalSupply)} {units.pressure}
					</span>
				</p>
				{fillMinutes !== null && (
					<p className='text-text'>
						Est. fill time at {driveRate} {units.airFlow}:{' '}
						<span className='font-semibold'>{Math.round(fillMinutes)} min</span>
					</p>
				)}
			</section>

			{chartSeries.length > 0 && (
				<BoosterChart xLabels={xLabels} series={chartSeries} />
			)}
		</div>
	)
}

export default BoosterCalculator

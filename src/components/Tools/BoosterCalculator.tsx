'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import {
	boosterFillProfile,
	boosterTiming,
	calculateBooster,
} from '@/lib/diveMath/booster'
import {
	fromBar,
	fromLiters,
	fromLpm,
	toBar,
	toLpm,
} from '@/lib/diveMath/units'
import CycleRateChart from './CycleRateChart'
import DualAxisChart from './DualAxisChart'
import BoosterPicker from './BoosterPicker'
import SafetyNote from './SafetyNote'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { usePressureState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const GAL_TO_L = 3.785411784
const HIGH_RATE = 1 // cycle/sec danger threshold
const LOW_RATE = 1 / 30 // cycle/sec warning threshold

function fmtDuration(sec: number): string {
	const m = Math.floor(sec / 60)
	const s = Math.round(sec % 60)
	return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const BoosterCalculator = () => {
	const { units } = useUnits()
	const [ratio, setRatio] = useState(30)
	const [driveP, setDriveP] = usePressureState(150)
	const [twoStage, setTwoStage] = useState(false)
	const [regulatedInlet, setRegulatedInlet] = usePressureState(150)
	const [vdPerCycle, setVdPerCycle] = useState(0)
	const [driveMax, setDriveMax] = useState(0)
	const [supplyVol, setSupplyVol] = useState(50)
	const [supplyStart, setSupplyStart] = usePressureState(2900)
	const [receiverVol, setReceiverVol] = useState(11.1)
	const [receiverStart, setReceiverStart] = usePressureState(500)
	const [target, setTarget] = usePressureState(3000)
	const [compressorRate, setCompressorRate] = useState(0)
	const [storageGal, setStorageGal] = useState(0)
	const [storageMax, setStorageMax] = usePressureState(175)
	const [storageMin, setStorageMin] = usePressureState(125)

	const input = {
		ratio,
		driveP: toBar(driveP, units.pressure),
		supplyVol,
		supplyStart: toBar(supplyStart, units.pressure),
		receiverVol,
		receiverStart: toBar(receiverStart, units.pressure),
		target: toBar(target, units.pressure),
		regulatedInletBar: twoStage
			? toBar(regulatedInlet, units.pressure)
			: undefined,
	}
	const result = calculateBooster(input)

	const timingArgs = {
		driveAirL: result.driveAirL,
		vdPerCycleL: toLpm(vdPerCycle, units.airFlow),
		driveMaxLpm: toLpm(driveMax, units.airFlow),
		compressorRateLpm: toLpm(compressorRate, units.airFlow),
		drivePBar: toBar(driveP, units.pressure),
		storageL: storageGal * GAL_TO_L,
		storageMaxBar: toBar(storageMax, units.pressure),
		storageMinBar: toBar(storageMin, units.pressure),
	}
	const timing = boosterTiming(timingArgs)
	const profile = boosterFillProfile(input, 40, timing ? timingArgs : undefined)
	const hasTime = profile.length > 0 && profile[0].timeSeconds !== undefined

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const vol = (l: number) => Math.round(fromLiters(l, units.volume))

	const last = profile.length ? profile[profile.length - 1] : null
	const xCaptionTime = 'Time'
	const xCaptionPressure = `Receiver pressure (${units.pressure})`

	const fastWarn = timing != null && timing.cycleRate1 > HIGH_RATE
	const slowWarn =
		timing != null && timing.dutyContinuous && timing.cycleRate2 < LOW_RATE

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume', 'airFlow']} />

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Booster</h2>
				<BoosterPicker
					onSelect={(preset) => {
						setRatio(preset.ratio)
						setTwoStage(preset.twoStage)
						setVdPerCycle(fromLpm(preset.vdPerCycleL, units.airFlow))
						setDriveMax(fromLpm(preset.driveMaxLpm, units.airFlow))
					}}
				/>
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
					<NumberInput
						id='b-vd'
						name='b-vd'
						label={`Drive air / cycle (${units.airFlow === 'lpm' ? 'L' : 'CF'})`}
						value={vdPerCycle}
						onChange={setVdPerCycle}
						min={0}
						tooltip='Drive air consumed per cycle, from the booster datasheet. Enables cycle timing.'
					/>
					<NumberInput
						id='b-dmax'
						name='b-dmax'
						label={`Max drive-air consumption (${units.airFlow})`}
						value={driveMax}
						onChange={setDriveMax}
						min={0}
						tooltip='Booster max free-air consumption at full speed, from the datasheet.'
					/>
				</div>
				<Checkbox
					id='b-2stage'
					name='b-2stage'
					title='Two-stage (regulated inlet)'
					checked={twoStage}
					onChange={setTwoStage}
				/>
				{twoStage && (
					<NumberInput
						id='b-reg'
						name='b-reg'
						label={`Regulated inlet pressure (${units.pressure})`}
						value={regulatedInlet}
						onChange={setRegulatedInlet}
						min={0}
						tooltip='Low pressure the source is regulated to before the first stage.'
					/>
				)}
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
				</div>
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>
					Drive compressor (optional)
				</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='b-crate'
						name='b-crate'
						label={`Compressor output (${units.airFlow})`}
						value={compressorRate}
						onChange={setCompressorRate}
						min={0}
					/>
					<NumberInput
						id='b-stgal'
						name='b-stgal'
						label='Storage volume (gal)'
						value={storageGal}
						onChange={setStorageGal}
						min={0}
					/>
					<NumberInput
						id='b-stmax'
						name='b-stmax'
						label={`Storage cut-out / full (${units.pressure})`}
						value={storageMax}
						onChange={setStorageMax}
						min={0}
						tooltip='Pressure the compressor fills the storage tank to before shutting off. The usable buffer is the gas between this and the drive pressure.'
					/>
					<NumberInput
						id='b-stmin'
						name='b-stmin'
						label={`Storage cut-in / restart (${units.pressure})`}
						value={storageMin}
						onChange={setStorageMin}
						min={0}
						tooltip='Pressure at which the compressor restarts. Sets how often it cycles on/off when it keeps up — it does not set the buffer floor (that is the drive pressure).'
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
			{fastWarn && (
				<SafetyNote level='danger'>
					Booster cycling faster than ~1/sec — hard on the booster; lower the
					drive pressure or use a smaller drive supply.
				</SafetyNote>
			)}
			{slowWarn && (
				<SafetyNote level='warning'>
					Compressor undersized — the booster cycles very slowly (
					{fmtDuration(timing!.phase2Seconds)} of the fill at{' '}
					{timing!.cycleRate2.toFixed(2)}/sec).
				</SafetyNote>
			)}

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Estimate</h2>
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
					Process gas boosted:{' '}
					<span className='font-semibold'>
						{vol(result.processGasL)} {units.volume}
					</span>
				</p>
				<p className='text-text'>
					Final supply pressure:{' '}
					<span className='font-semibold'>
						{p(result.finalSupply)} {units.pressure}
					</span>
				</p>
				{timing && result.driveAirL > 0 && (
					<>
						<p className='text-text'>
							Total cycles:{' '}
							<span className='font-semibold'>
								{Math.round(timing.totalCycles)}
							</span>
						</p>
						<p className='text-text'>
							Fill time:{' '}
							<span className='font-semibold'>
								{fmtDuration(timing.fillSeconds)}
							</span>
						</p>
						<p className='text-text'>
							Compressor duty:{' '}
							<span className='font-semibold'>
								{timing.dutyContinuous
									? '~100% (continuous)'
									: `${Math.round(timing.dutyCycle * 100)}%`}
							</span>
						</p>
						{!timing.dutyContinuous && timing.compressorOnSeconds > 0 && (
							<p className='text-text'>
								Compressor cycle:{' '}
								<span className='font-semibold'>
									~{fmtDuration(timing.compressorOnSeconds)} on /{' '}
									{fmtDuration(timing.compressorOffSeconds)} off
								</span>
							</p>
						)}
					</>
				)}
			</section>

			{profile.length > 0 && (
				<DualAxisChart
					x={
						hasTime
							? profile.map((pt) => pt.timeSeconds!)
							: profile.map((pt) => fromBar(pt.receiverP, units.pressure))
					}
					xLabels={
						hasTime
							? [
									fmtDuration(0),
									fmtDuration((last!.timeSeconds ?? 0) / 2),
									fmtDuration(last!.timeSeconds ?? 0),
								]
							: [
									`${p(profile[0].receiverP)}`,
									`${p(profile[Math.floor(profile.length / 2)].receiverP)}`,
									`${p(last!.receiverP)}`,
								]
					}
					xCaption={hasTime ? xCaptionTime : xCaptionPressure}
					left={{
						label: 'Supply',
						colorClass: 'text-light-text',
						unit: units.pressure,
						values: profile.map((pt) => fromBar(pt.supplyP, units.pressure)),
					}}
					right={{
						label: 'Receiver',
						colorClass: 'text-accent',
						unit: units.pressure,
						values: profile.map((pt) => fromBar(pt.receiverP, units.pressure)),
					}}
				/>
			)}
			{hasTime && (
				<CycleRateChart
					xLabels={[
						fmtDuration(0),
						fmtDuration((last!.timeSeconds ?? 0) / 2),
						fmtDuration(last!.timeSeconds ?? 0),
					]}
					xCaption={xCaptionTime}
					rates={profile.map((pt) => pt.cycleRatePerSec ?? 0)}
					highPerSec={HIGH_RATE}
					lowPerSec={LOW_RATE}
				/>
			)}
		</div>
	)
}

export default BoosterCalculator

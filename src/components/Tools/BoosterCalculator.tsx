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
	ATMOSPHERIC_BAR,
	fromBar,
	fromLiters,
	fromLpm,
	toBar,
	toLpm,
} from '@/lib/diveMath/units'
import BoosterChart from './BoosterChart'
import CycleRateChart from './CycleRateChart'
import CylinderFields from './CylinderFields'
import DualAxisChart from './DualAxisChart'
import BoosterPicker from './BoosterPicker'
import MixPicker from './MixPicker'
import RealGasNote from './RealGasNote'
import SafetyNote from './SafetyNote'
import TemperatureResult from './TemperatureResult'
import { usePressureState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const GAL_TO_L = 3.785411784
const HIGH_RATE = 1 // cycle/sec danger threshold
const LOW_RATE = 1 / 30 // cycle/sec band reference

function fmtDuration(sec: number): string {
	const m = Math.floor(sec / 60)
	const s = Math.round(sec % 60)
	return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const BoosterCalculator = () => {
	const { units, useRealGas } = useUnits()
	const [ratio, setRatio] = useState(30)
	const [driveP, setDriveP] = usePressureState(120)
	const [o2Pct, setO2Pct] = useState(100)
	const [hePct, setHePct] = useState(0)
	const [twoStage, setTwoStage] = useState(false)
	const [regulatedInlet, setRegulatedInlet] = usePressureState(150)
	const [driveSwept, setDriveSwept] = useState(0)
	const [maxCpm, setMaxCpm] = useState(0)
	const [supplyVol, setSupplyVol] = useState(50)
	const [supplyStart, setSupplyStart] = usePressureState(2900)
	const [supplyWorking, setSupplyWorking] = usePressureState(2900)
	const [receiverVol, setReceiverVol] = useState(5.7)
	const [receiverStart, setReceiverStart] = usePressureState(0)
	const [receiverWorking, setReceiverWorking] = usePressureState(3000)
	const [target, setTarget] = usePressureState(3000)
	const [maxFillRate, setMaxFillRate] = usePressureState(300)
	const [compressorRate, setCompressorRate] = useState(0)
	const [storageGal, setStorageGal] = useState(0)
	const [storageMax, setStorageMax] = usePressureState(175)
	const [storageMin, setStorageMin] = usePressureState(125)

	const supplyStartBar = toBar(supplyStart, units.pressure)
	const receiverStartBar = toBar(receiverStart, units.pressure)
	const targetBar = toBar(target, units.pressure)

	const input = {
		ratio,
		driveP: toBar(driveP, units.pressure),
		supplyVol,
		supplyStart: supplyStartBar,
		receiverVol,
		receiverStart: receiverStartBar,
		target: targetBar,
		regulatedInletBar: twoStage
			? toBar(regulatedInlet, units.pressure)
			: undefined,
		fo2: o2Pct / 100,
		fhe: hePct / 100,
		useRealGas,
	}
	const result = calculateBooster(input)

	const equalizes = supplyStartBar > receiverStartBar
	const boostStartBar = equalizes ? result.eqPressure : receiverStartBar
	const inletStartAbsBar =
		(equalizes ? result.eqPressure : supplyStartBar) + ATMOSPHERIC_BAR
	const riseBar = Math.max(0, targetBar - boostStartBar)

	const eqRiseBar = Math.max(0, boostStartBar - receiverStartBar)
	const timingArgs = {
		driveAirL: result.driveAirL,
		riseBar,
		eqRiseBar,
		receiverVolL: receiverVol,
		maxFillRateBarPerMin: toBar(maxFillRate, units.pressure),
		driveSweptL: driveSwept,
		maxCpm,
		ratio,
		supplyAbsBar: inletStartAbsBar,
		driveStartBar: result.driveStart,
		driveEndBar: result.driveEnd,
		compressorRateLpm: toLpm(compressorRate, units.airFlow),
		storageL: storageGal * GAL_TO_L,
		storageMaxBar: toBar(storageMax, units.pressure),
		storageMinBar: toBar(storageMin, units.pressure),
		fo2: o2Pct / 100,
		fhe: hePct / 100,
		useRealGas,
	}
	const timing = boosterTiming(timingArgs)
	const profile = boosterFillProfile(input, 40, timing ? timingArgs : undefined)
	const hasTime = profile.length > 0 && profile[0].timeSeconds !== undefined

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const p1 = (bar: number) => fromBar(bar, units.pressure)
	const vol = (l: number) => Math.round(fromLiters(l, units.volume))
	const flow = (lpm: number) => Math.round(fromLpm(lpm, units.airFlow))

	const last = profile.length ? profile[profile.length - 1] : null
	const xCaptionTime = 'Time'
	const xCaptionPressure = `Receiver pressure (${units.pressure})`

	const xCaption = hasTime ? xCaptionTime : xCaptionPressure
	const xValues = hasTime
		? profile.map((pt) => pt.timeSeconds!)
		: profile.map((pt) => fromBar(pt.receiverP, units.pressure))
	const xLabels =
		profile.length === 0
			? []
			: hasTime
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

	const stallMarkers =
		hasTime && timing && timing.stallSeconds != null
			? [{ x: timing.stallSeconds, label: 'stall', colorClass: 'text-danger' }]
			: []

	const hasBufferLine =
		profile.length > 0 && profile[0].driveBufferFrac !== undefined

	const fastWarn = timing != null && timing.cycleRatePerSec > HIGH_RATE

	return (
		<div className='2xl:relative'>
			<div className='space-y-6'>
				<section className='space-y-3'>
					<h2 className='text-text text-lg font-semibold'>Booster</h2>
					<BoosterPicker
						onSelect={(preset) => {
							setRatio(preset.ratio)
							setTwoStage(preset.twoStage)
							setDriveSwept(preset.driveSweptL)
							setMaxCpm(preset.maxCpm)
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
							label={`Max drive pressure (${units.pressure})`}
							value={driveP}
							onChange={setDriveP}
							min={0}
							tooltip='Highest drive pressure the regulator can supply — sets the stall ceiling (ratio × this). The booster only uses as much as the back-pressure needs.'
						/>
						<NumberInput
							id='b-swept'
							name='b-swept'
							label='Drive swept volume / cycle (L)'
							value={driveSwept}
							onChange={setDriveSwept}
							min={0}
							tooltip='Air-drive piston displacement per cycle (geometric). The actual drive-air per cycle is this × drive-pressure-abs / atmosphere.'
						/>
						<NumberInput
							id='b-cpm'
							name='b-cpm'
							label='Max cycle rate (cycles/min)'
							value={maxCpm}
							onChange={setMaxCpm}
							min={0}
							tooltip='Booster max cycling speed. Caps how fast it can fill if that is slower than the fill-rate limit.'
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
					<h2 className='text-text text-lg font-semibold'>Boosted gas</h2>
					<MixPicker
						id='b-mix'
						onSelect={(o2, he) => {
							setO2Pct(o2)
							setHePct(he)
						}}
					/>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<NumberInput
							id='b-o2'
							name='b-o2'
							label='O₂ (%)'
							value={o2Pct}
							onChange={setO2Pct}
							min={0}
							max={100}
							tooltip='Gas being boosted — sets the compressibility (Z) when real-gas is on.'
						/>
						<NumberInput
							id='b-he'
							name='b-he'
							label='He (%)'
							value={hePct}
							onChange={setHePct}
							min={0}
							max={100}
						/>
					</div>
				</section>

				<section className='space-y-3'>
					<h2 className='text-text text-lg font-semibold'>Supply cylinder</h2>
					<CylinderFields
						idPrefix='b-supply'
						category='industrial'
						waterVolumeL={supplyVol}
						onWaterVolumeL={setSupplyVol}
						working={{ value: supplyWorking, onChange: setSupplyWorking }}
						filled={{
							value: supplyStart,
							onChange: setSupplyStart,
							label: 'Current pressure',
						}}
					/>
				</section>

				<section className='space-y-3'>
					<h2 className='text-text text-lg font-semibold'>Receiver cylinder</h2>
					<CylinderFields
						idPrefix='b-receiver'
						category={['scuba', 'cascade']}
						waterVolumeL={receiverVol}
						onWaterVolumeL={setReceiverVol}
						working={{ value: receiverWorking, onChange: setReceiverWorking }}
						start={{
							value: receiverStart,
							onChange: setReceiverStart,
							label: 'Start pressure',
						}}
						filled={{
							value: target,
							onChange: setTarget,
							label: 'Target pressure',
						}}
					/>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<NumberInput
							id='b-fillrate'
							name='b-fillrate'
							label={`Max fill rate (${units.pressure}/min)`}
							value={maxFillRate}
							onChange={setMaxFillRate}
							min={0}
							tooltip='Standard safe fill rate (≈300 psi/min for oxygen). The fill time is the pressure rise divided by this, unless the booster is even slower.'
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
							tooltip='Pressure the compressor fills the storage tank to before shutting off.'
						/>
						<NumberInput
							id='b-stmin'
							name='b-stmin'
							label={`Storage cut-in / restart (${units.pressure})`}
							value={storageMin}
							onChange={setStorageMin}
							min={0}
							tooltip='Pressure at which the compressor restarts.'
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
						At this fill rate the booster cycles faster than ~1/sec — hard on
						the booster. Slow the fill rate or fit a larger gas head.
					</SafetyNote>
				)}
				{timing?.boosterLimited && (
					<SafetyNote level='warning'>
						The booster can&apos;t reach the requested fill rate — it&apos;s
						running flat out, so the fill is slower than the limit.
					</SafetyNote>
				)}
				{timing?.stallSeconds != null && (
					<SafetyNote level='warning'>
						Drive-gas storage runs out at {fmtDuration(timing.stallSeconds)} —
						the compressor can&apos;t keep up and the booster will stall and
						wait. Use a bigger compressor or storage tank.
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
					{result.driveAirL > 0 && (
						<p className='text-text'>
							Drive pressure used:{' '}
							<span className='font-semibold'>
								{p(result.driveStart)}→{p(result.driveEnd)} {units.pressure}
							</span>{' '}
							<span className='text-light-text'>(ramps as receiver fills)</span>
						</p>
					)}
					{timing && result.driveAirL > 0 && (
						<>
							<p className='text-text'>
								Fill time:{' '}
								<span className='font-semibold'>
									{fmtDuration(timing.fillSeconds)}
								</span>
							</p>
							<p className='text-text'>
								Cycle rate:{' '}
								<span className='font-semibold'>
									~{timing.cycleRatePerSec.toFixed(2)}/sec
								</span>
							</p>
							<p className='text-text'>
								Avg drive-air rate:{' '}
								<span className='font-semibold'>
									{flow(timing.driveAirRateLpm)} {units.airFlow}
								</span>
							</p>
							{compressorRate > 0 && (
								<p className='text-text'>
									Compressor duty:{' '}
									<span className='font-semibold'>
										{timing.dutyContinuous
											? '~100% (can’t keep up)'
											: `${Math.round(timing.dutyCycle * 100)}%`}
									</span>
								</p>
							)}
						</>
					)}
					<TemperatureResult goalBar={targetBar} />
				</section>

				{profile.length > 0 && (
					<DualAxisChart
						x={xValues}
						xLabels={xLabels}
						xCaption={xCaption}
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
							values: profile.map((pt) =>
								fromBar(pt.receiverP, units.pressure),
							),
						}}
						extra={
							hasBufferLine
								? {
										label: 'Storage buffer',
										colorClass: 'text-warning',
										valuesFrac: profile.map((pt) => pt.driveBufferFrac ?? 0),
									}
								: undefined
						}
						markers={stallMarkers}
					/>
				)}
				{hasTime && (
					<CycleRateChart
						x={xValues}
						xLabels={xLabels}
						xCaption={xCaptionTime}
						rates={profile.map((pt) => pt.cycleRatePerSec ?? 0)}
						highPerSec={HIGH_RATE}
						lowPerSec={LOW_RATE}
						markers={stallMarkers}
					/>
				)}
				{hasTime && last && (
					<BoosterChart
						x={xValues}
						xLabels={xLabels}
						xCaption={xCaption}
						series={[
							{
								label: 'Drive pressure (regulated)',
								colorClass: 'text-accent',
								values: profile.map((pt) => p1(pt.drivePBar ?? 0)),
								rangeLabel: `${p(result.driveStart)}–${p(result.driveEnd)} ${units.pressure}`,
							},
							...(hasBufferLine
								? [
										{
											label: 'Drive-gas draw from storage',
											colorClass: 'text-light-text',
											values: profile.map((pt) => flow(pt.storageDrawLpm ?? 0)),
											rangeLabel: `0–${flow(
												Math.max(
													...profile.map((pt) => pt.storageDrawLpm ?? 0),
												),
											)} ${units.airFlow}`,
										},
									]
								: []),
						]}
					/>
				)}
			</div>
			<div className='mt-6 2xl:absolute 2xl:top-0 2xl:left-full 2xl:mt-0 2xl:ml-8 2xl:w-72'>
				<RealGasNote />
			</div>
		</div>
	)
}

export default BoosterCalculator

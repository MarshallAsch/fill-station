'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { type BlendComponent, calculateBlend } from '@/lib/diveMath/blending'
import { toBar } from '@/lib/diveMath/units'
import { roundPressure } from '@/lib/diveMath/format'
import MixPicker from './MixPicker'
import HotFillNote from './HotFillNote'
import RealGasNote from './RealGasNote'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'
import { useHotFill } from './useHotFill'

const BLEND_LABEL: Record<BlendComponent, string> = {
	o2: 'O₂',
	he: 'Helium',
	top: 'Top-up gas',
}

const BlendCalculator = () => {
	const { units, useRealGas } = useUnits()
	const hot = useHotFill()
	const [startPressure, setStartPressure] = usePersistedPressure('bl.start', 0)
	const [startO2, setStartO2] = usePersistedState('bl.startO2', 21)
	const [startHe, setStartHe] = usePersistedState('bl.startHe', 0)
	const [finalPressure, setFinalPressure] = usePersistedPressure(
		'bl.final',
		3000,
	)
	const hotFinal = hot.hotFill(finalPressure)
	const [targetO2, setTargetO2] = usePersistedState('bl.targetO2', 32)
	const [targetHe, setTargetHe] = usePersistedState('bl.targetHe', 0)
	const [topO2, setTopO2] = usePersistedState('bl.topO2', 21)
	const [topHe, setTopHe] = usePersistedState('bl.topHe', 0)
	const [order, setOrder] = usePersistedState<BlendComponent[]>('bl.order', [
		'he',
		'o2',
		'top',
	])

	const result = calculateBlend(
		{
			startPressure: toBar(startPressure, units.pressure),
			startFo2: startO2 / 100,
			startFhe: startHe / 100,
			finalPressure: toBar(hotFinal, units.pressure),
			targetFo2: targetO2 / 100,
			targetFhe: targetHe / 100,
			topupFo2: topO2 / 100,
			topupFhe: topHe / 100,
			order,
		},
		{ useRealGas },
	)

	const startMixInvalid = startO2 + startHe > 100
	const targetMixInvalid = targetO2 + targetHe > 100
	const topMixInvalid = topO2 + topHe > 100

	const move = (i: number, dir: -1 | 1) =>
		setOrder((prev) => {
			const next = [...prev]
			const j = i + dir
			if (j < 0 || j >= next.length) return prev
			;[next[i], next[j]] = [next[j], next[i]]
			return next
		})

	return (
		<div className='2xl:relative'>
			<div className='space-y-6'>
				<section className='space-y-4'>
					<h2 className='text-text text-lg font-semibold'>Starting gas</h2>
					<MixPicker
						id='bl-start-mix'
						onSelect={(o2, he) => {
							setStartO2(o2)
							setStartHe(he)
						}}
					/>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<NumberInput
							id='bl-start-pr'
							name='bl-start-pr'
							label={`Pressure (${units.pressure})`}
							value={startPressure}
							onChange={setStartPressure}
							min={0}
						/>
						<NumberInput
							id='bl-start-o2'
							name='bl-start-o2'
							label='O₂ (%)'
							value={startO2}
							onChange={setStartO2}
							min={0}
							max={100}
						/>
						<NumberInput
							id='bl-start-he'
							name='bl-start-he'
							label='He (%)'
							value={startHe}
							onChange={setStartHe}
							min={0}
							max={100}
						/>
					</div>
					{startMixInvalid && (
						<SafetyNote level='danger'>
							O₂ + He exceeds 100% — not a valid mix.
						</SafetyNote>
					)}
				</section>

				<section className='space-y-4'>
					<h2 className='text-text text-lg font-semibold'>Target gas</h2>
					<MixPicker
						id='bl-target-mix'
						onSelect={(o2, he) => {
							setTargetO2(o2)
							setTargetHe(he)
						}}
					/>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<NumberInput
							id='bl-final-pr'
							name='bl-final-pr'
							label={`Pressure (${units.pressure})`}
							value={finalPressure}
							onChange={setFinalPressure}
							min={0}
						/>
						<NumberInput
							id='bl-target-o2'
							name='bl-target-o2'
							label='O₂ (%)'
							value={targetO2}
							onChange={setTargetO2}
							min={0}
							max={100}
						/>
						<NumberInput
							id='bl-target-he'
							name='bl-target-he'
							label='He (%)'
							value={targetHe}
							onChange={setTargetHe}
							min={0}
							max={100}
						/>
					</div>
					{targetMixInvalid && (
						<SafetyNote level='danger'>
							O₂ + He exceeds 100% — not a valid mix.
						</SafetyNote>
					)}
				</section>

				<section className='space-y-4'>
					<h2 className='text-text text-lg font-semibold'>Top-up gas</h2>
					<MixPicker
						id='bl-top-mix'
						onSelect={(o2, he) => {
							setTopO2(o2)
							setTopHe(he)
						}}
					/>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<NumberInput
							id='bl-top-o2'
							name='bl-top-o2'
							label='O₂ (%)'
							value={topO2}
							onChange={setTopO2}
							min={0}
							max={100}
						/>
						<NumberInput
							id='bl-top-he'
							name='bl-top-he'
							label='He (%)'
							value={topHe}
							onChange={setTopHe}
							min={0}
							max={100}
						/>
					</div>
					{topMixInvalid && (
						<SafetyNote level='danger'>
							O₂ + He exceeds 100% — not a valid mix.
						</SafetyNote>
					)}
				</section>

				<section className='border-border space-y-2 rounded-md border p-4'>
					<h2 className='text-text text-lg font-semibold'>Fill sequence</h2>
					{result.feasible ? (
						<>
							<ol className='text-text list-decimal space-y-1 pl-5'>
								{result.bleedBar > 0.01 && (
									<li>
										<span className='font-semibold'>Bleed down</span>
										{': to '}
										<span className='font-semibold'>
											{roundPressure(result.bleedTo, units.pressure)}{' '}
											{units.pressure}
										</span>
									</li>
								)}
								{result.steps
									.filter((step) => Math.abs(step.addBar) >= 0.01)
									.map((step) => (
										<li key={step.gas}>
											<span className='font-semibold'>{step.label}</span>
											{': add to '}
											<span className='font-semibold'>
												{roundPressure(step.toBar, units.pressure)}{' '}
												{units.pressure}
											</span>
										</li>
									))}
							</ol>
							{result.steps.some((s) => Math.abs(s.addBar) >= 0.01) && (
								<div className='border-border mt-3 border-t pt-3'>
									<p className='text-light-text mb-2 text-xs font-medium tracking-wide uppercase'>
										Reorder steps
									</p>
									<div className='space-y-1'>
										{order.map((gas, i) => (
											<div key={gas} className='flex items-center gap-2'>
												<span className='text-text w-24 text-sm'>
													{BLEND_LABEL[gas]}
												</span>
												<button
													type='button'
													onClick={() => move(i, -1)}
													disabled={i === 0}
													className='text-light-text hover:text-accent px-2 py-1 disabled:opacity-30'
													aria-label={`Move ${BLEND_LABEL[gas]} up`}
												>
													▲
												</button>
												<button
													type='button'
													onClick={() => move(i, 1)}
													disabled={i === order.length - 1}
													className='text-light-text hover:text-accent px-2 py-1 disabled:opacity-30'
													aria-label={`Move ${BLEND_LABEL[gas]} down`}
												>
													▼
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					) : (
						<p className='text-light-text text-sm'>{result.reason}</p>
					)}
					{hot.on && <HotFillNote cold={finalPressure} hot={hotFinal} />}
				</section>
			</div>
			<div className='mt-6 2xl:absolute 2xl:top-0 2xl:left-full 2xl:mt-0 2xl:ml-8 2xl:w-72'>
				<RealGasNote />
			</div>
		</div>
	)
}

export default BlendCalculator

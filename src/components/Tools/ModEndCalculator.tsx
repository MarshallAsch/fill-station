'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { fmtMix, roundDepthDown } from '@/lib/diveMath/format'
import {
	calculateEnd,
	calculateMod,
	EndModel,
	Water,
} from '@/lib/diveMath/modEnd'
import { AIR_FN2, toMeters } from '@/lib/diveMath/units'
import FormulaPanel, { FormulaRow } from './FormulaPanel'
import { Frac, MathExpr } from './Math'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { usePersistedDepth } from './useUnitState'
import { usePersistedState } from './usePersistedState'
import { useUnits } from './UnitsProvider'

const ModEndCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = usePersistedState('me.fo2', 32)
	const [fhe, setFhe] = usePersistedState('me.fhe', 0)
	const [ppo2, setPpo2] = usePersistedState('me.ppo2', 1.4)
	const [water, setWater] = usePersistedState<Water>('me.water', 'salt')
	const [model, setModel] = usePersistedState<EndModel>(
		'me.model',
		'o2-narcotic',
	)
	const [depth, setDepth] = usePersistedDepth('me.depth', 100)

	const fo2Frac = fo2 / 100
	const fheFrac = fhe / 100
	const depthM = toMeters(depth, units.depth)

	const modEditable = calculateMod({ fo2: fo2Frac, ppo2, water })
	const mod16 = calculateMod({ fo2: fo2Frac, ppo2: 1.6, water })
	const end = calculateEnd({
		fo2: fo2Frac,
		fhe: fheFrac,
		depth: depthM,
		water,
		model,
	})

	const mixInvalid = fo2 + fhe > 100

	const d0 = water === 'fresh' ? 10.3 : 10
	const fn2Frac = 1 - fo2Frac - fheFrac
	const m1 = (m: number) => m.toFixed(1)
	const f3 = (f: number) => f.toFixed(3)
	const disp = (m: number) => `${roundDepthDown(m, units.depth)} ${units.depth}`

	const endExpr =
		model === 'o2-narcotic' ? (
			<MathExpr>
				END = (depth + D₀)(1 − FHe) − D₀ = ({m1(depthM)} + {d0})(1 −{' '}
				{f3(fheFrac)}) − {d0} = {m1(end)} m ≈ {disp(end)}
			</MathExpr>
		) : (
			<MathExpr>
				FN₂ = 1 − FO₂ − FHe = {f3(fn2Frac)}; END = (depth + D₀) ×{' '}
				<Frac num='FN₂' den={`${AIR_FN2}`} /> − D₀ = {m1(end)} m ≈ {disp(end)}
			</MathExpr>
		)

	const formulaRows: FormulaRow[] = [
		{
			label: 'Inputs',
			expr: (
				<MathExpr>
					FO₂ = {f3(fo2Frac)} · FHe = {f3(fheFrac)} · depth = {depth}{' '}
					{units.depth} = {m1(depthM)} m · D₀ = {d0} m/bar ({water})
				</MathExpr>
			),
		},
		{
			label: `MOD @ ppO₂ ${ppo2}`,
			expr: (
				<MathExpr>
					(<Frac num='ppO₂' den='FO₂' /> − 1) × D₀ = (
					<Frac num={`${ppo2}`} den={f3(fo2Frac)} /> − 1) × {d0} ={' '}
					{m1(modEditable)} m ≈ {disp(modEditable)}
				</MathExpr>
			),
		},
		{
			label: 'MOD @ ppO₂ 1.6',
			expr: (
				<MathExpr>
					(<Frac num='1.6' den={f3(fo2Frac)} /> − 1) × {d0} = {m1(mod16)} m ≈{' '}
					{disp(mod16)}
				</MathExpr>
			),
		},
		{
			label: `END (${model === 'o2-narcotic' ? 'O₂ narcotic' : 'N₂ only'})`,
			expr: endExpr,
		},
	]

	return (
		<div className='2xl:relative'>
			<div className='space-y-6'>
				<section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<MixPicker
						id='me-mix'
						onSelect={(o2, he) => {
							setFo2(o2)
							setFhe(he)
						}}
					/>
					<NumberInput
						id='me-fo2'
						name='me-fo2'
						label='O₂ (%)'
						value={fo2}
						onChange={setFo2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='me-fhe'
						name='me-fhe'
						label='He (%)'
						value={fhe}
						onChange={setFhe}
						min={0}
						max={100}
					/>
					<NumberInput
						id='me-ppo2'
						name='me-ppo2'
						label='Working ppO₂'
						value={ppo2}
						onChange={setPpo2}
						min={0}
						max={3}
						step={0.1}
					/>
				</section>
				{mixInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}

				<section className='flex flex-wrap gap-6'>
					<RadioGroup
						title='Water'
						name='water'
						value={water}
						onChange={(v) => setWater(v as Water)}
						options={[
							{ value: 'salt', label: 'Salt' },
							{ value: 'fresh', label: 'Fresh' },
						]}
					/>
					<RadioGroup
						title='END model'
						name='end-model'
						value={model}
						onChange={(v) => setModel(v as EndModel)}
						options={[
							{ value: 'o2-narcotic', label: 'O₂ narcotic' },
							{ value: 'n2-only', label: 'N₂ only' },
						]}
					/>
				</section>

				<section className='border-border space-y-2 rounded-md border p-4'>
					<h2 className='text-text text-lg font-semibold'>
						Maximum operating depth
					</h2>
					<p className='text-text'>
						Mix: <span className='font-semibold'>{fmtMix(fo2, fhe)}</span>
					</p>
					<p className='text-text'>
						ppO₂ {ppo2}:{' '}
						<span className='font-semibold'>
							{roundDepthDown(modEditable, units.depth)} {units.depth}
						</span>
					</p>
					<p className='text-text'>
						ppO₂ 1.6:{' '}
						<span className='font-semibold'>
							{roundDepthDown(mod16, units.depth)} {units.depth}
						</span>
					</p>
				</section>

				<section className='border-border space-y-3 rounded-md border p-4'>
					<h2 className='text-text text-lg font-semibold'>
						Equivalent narcotic depth
					</h2>
					<NumberInput
						id='me-depth'
						name='me-depth'
						label={`Planned depth (${units.depth})`}
						value={depth}
						onChange={setDepth}
						min={0}
					/>
					<p className='text-text'>
						END at {depth} {units.depth}:{' '}
						<span className='font-semibold'>
							{roundDepthDown(end, units.depth)} {units.depth}
						</span>
					</p>
				</section>
			</div>
			<div className='mt-6 2xl:absolute 2xl:top-0 2xl:left-full 2xl:mt-0 2xl:ml-8 2xl:w-72'>
				<FormulaPanel rows={formulaRows} />
			</div>
		</div>
	)
}

export default ModEndCalculator

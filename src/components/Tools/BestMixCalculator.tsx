'use client'

import { useState } from 'react'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { bestMix } from '@/lib/diveMath/bestMix'
import { calculateMod, Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import FormulaPanel, { FormulaRow } from './FormulaPanel'
import { Frac, MathExpr } from './Math'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { useDepthState } from './useUnitState'

const BestMixCalculator = () => {
	const { units } = useUnits()
	const [depth, setDepth] = useDepthState(100)
	const [ppo2, setPpo2] = useState(1.4)
	const [water, setWater] = useState<Water>('salt')
	const [useHe, setUseHe] = useState(false)
	const [targetEnd, setTargetEnd] = useDepthState(100)

	const depthM = toMeters(depth, units.depth)
	const mix = bestMix({
		depthM,
		ppo2,
		targetEndM: useHe ? toMeters(targetEnd, units.depth) : undefined,
		water,
	})
	const fo2Pct = Math.round(mix.fo2 * 100)
	const fhePct = Math.round(mix.fhe * 100)
	const mod = calculateMod({ fo2: mix.fo2, ppo2, water })

	const ppo2Danger = ppo2 > 1.6
	const ppo2Warning = !ppo2Danger && ppo2 > 1.4

	const d0 = water === 'fresh' ? 10.3 : 10
	const ata = depthM / d0 + 1
	const endM = toMeters(targetEnd, units.depth)
	const m1 = (m: number) => m.toFixed(1)
	const f3 = (f: number) => f.toFixed(3)
	const disp = (m: number) =>
		`${Math.round(fromMeters(m, units.depth))} ${units.depth}`

	const formulaRows: FormulaRow[] = [
		{
			label: 'Inputs',
			expr: (
				<MathExpr>
					depth = {depth} {units.depth} = {m1(depthM)} m · ppO₂ = {ppo2} · D₀ ={' '}
					{d0} m/bar ({water})
				</MathExpr>
			),
		},
		{
			label: 'Ambient pressure (ata)',
			expr: (
				<MathExpr>
					<Frac num='depth' den='D₀' /> + 1 ={' '}
					<Frac num={`${m1(depthM)} m`} den={`${d0}`} /> + 1 = {ata.toFixed(2)}
				</MathExpr>
			),
		},
		{
			label: 'Best O₂ fraction',
			expr: (
				<MathExpr>
					FO₂ = <Frac num='ppO₂' den='ata' /> ={' '}
					<Frac num={`${ppo2}`} den={ata.toFixed(2)} /> = {f3(mix.fo2)} →{' '}
					{fo2Pct}%
				</MathExpr>
			),
		},
	]
	if (useHe) {
		formulaRows.push({
			label: 'Best He fraction',
			expr: (
				<MathExpr>
					FHe = 1 − <Frac num='END + D₀' den='depth + D₀' /> = 1 −{' '}
					<Frac num={`${m1(endM)} + ${d0}`} den={`${m1(depthM)} + ${d0}`} /> ={' '}
					{f3(mix.fhe)} → {fhePct}%
				</MathExpr>
			),
			note: `Target END = ${targetEnd} ${units.depth} = ${m1(endM)} m`,
		})
	}
	formulaRows.push({
		label: 'MOD at this mix',
		expr: (
			<MathExpr>
				MOD = (<Frac num='ppO₂' den='FO₂' /> − 1) × D₀ = (
				<Frac num={`${ppo2}`} den={f3(mix.fo2)} /> − 1) × {d0} = {m1(mod)} m ≈{' '}
				{disp(mod)}
			</MathExpr>
		),
	})

	return (
		<div className='2xl:relative'>
			<div className='space-y-6'>
				<section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='bm-depth'
						name='bm-depth'
						label={`Planned depth (${units.depth})`}
						value={depth}
						onChange={setDepth}
						min={0}
					/>
					<NumberInput
						id='bm-ppo2'
						name='bm-ppo2'
						label='Target ppO₂'
						value={ppo2}
						onChange={setPpo2}
						min={0}
						max={3}
						step={0.1}
					/>
				</section>
				{ppo2Danger && (
					<SafetyNote level='danger'>
						ppO₂ above 1.6 — unsafe, high O₂-toxicity risk.
					</SafetyNote>
				)}
				{ppo2Warning && (
					<SafetyNote level='warning'>
						ppO₂ above 1.4 exceeds the recommended working limit.
					</SafetyNote>
				)}
				<RadioGroup
					title='Water'
					name='bm-water'
					value={water}
					onChange={(v) => setWater(v as Water)}
					options={[
						{ value: 'salt', label: 'Salt' },
						{ value: 'fresh', label: 'Fresh' },
					]}
				/>
				<Checkbox
					id='bm-usehe'
					name='bm-usehe'
					title='Add helium to cap narcosis (END)'
					checked={useHe}
					onChange={setUseHe}
				/>
				{useHe && (
					<NumberInput
						id='bm-targetend'
						name='bm-targetend'
						label={`Target END (${units.depth})`}
						value={targetEnd}
						onChange={setTargetEnd}
						min={0}
					/>
				)}
				<section className='border-border space-y-2 rounded-md border p-4'>
					<h2 className='text-text text-lg font-semibold'>Recommended mix</h2>
					<p className='text-text text-2xl font-bold'>
						{fo2Pct}
						{fhePct > 0 ? `/${fhePct}` : ''}
						{fhePct > 0 ? ' (trimix)' : ' nitrox'}
					</p>
					<p className='text-light-text text-sm'>
						O₂ {fo2Pct}% · He {fhePct}% · N₂ {Math.round(mix.fn2 * 100)}%
					</p>
					<p className='text-text'>
						MOD at this mix &amp; ppO₂:{' '}
						<span className='font-semibold'>
							{Math.round(fromMeters(mod, units.depth))} {units.depth}
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

export default BestMixCalculator

export interface ChartSeries {
	label: string
	colorClass: string
	values: number[]
	rangeLabel: string
}

const W = 320
const H = 140
const PAD = 8

function normalize(values: number[]): number[] {
	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	return values.map((v) => (v - min) / span)
}

const BoosterChart = ({
	xLabels,
	series,
}: {
	xLabels: string[]
	series: ChartSeries[]
}) => {
	const n = series[0]?.values.length ?? 0
	if (n < 2) return null
	const x = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const y = (norm: number) => H - PAD - norm * (H - 2 * PAD)

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label='Booster fill profile'
			>
				{series.map((s) => {
					const norm = normalize(s.values)
					const pts = norm.map((v, i) => `${x(i)},${y(v)}`).join(' ')
					return (
						<g key={s.label} className={s.colorClass}>
							<polyline
								points={pts}
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
							/>
						</g>
					)
				})}
			</svg>
			<div className='text-light-text mt-1 flex justify-between text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<dl className='mt-3 space-y-1'>
				{series.map((s) => (
					<div key={s.label} className='flex items-center gap-2 text-xs'>
						<span className={`${s.colorClass} text-base leading-none`}>—</span>
						<span className='text-text'>{s.label}</span>
						<span className='text-light-text'>{s.rangeLabel}</span>
					</div>
				))}
			</dl>
		</div>
	)
}

export default BoosterChart

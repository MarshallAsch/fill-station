export interface ChartSeries {
	label: string
	colorClass: string
	values: number[]
	rangeLabel: string
}

// Each series gets its own small-multiple panel with its own y-scale, so the
// lines never overlap and magnitudes stay readable (the earlier overlay of
// normalized lines was hard to read). All panels share the x-axis (receiver
// pressure); the SVG scales uniformly to the container width.
const W = 320
const H = 60
const PAD = 6

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

	return (
		<div className='border-border bg-surface space-y-4 rounded-md border p-4'>
			{series.map((s) => {
				const min = Math.min(...s.values)
				const max = Math.max(...s.values)
				const span = max - min || 1
				const y = (v: number) => H - PAD - ((v - min) / span) * (H - 2 * PAD)
				const line = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
				const area = `${x(0)},${H - PAD} ${line} ${x(n - 1)},${H - PAD}`
				return (
					<div key={s.label}>
						<div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs'>
							<span className={`${s.colorClass} font-semibold`}>{s.label}</span>
							<span className='text-light-text'>{s.rangeLabel}</span>
						</div>
						<svg
							viewBox={`0 0 ${W} ${H}`}
							className='h-auto w-full'
							role='img'
							aria-label={`${s.label}: ${s.rangeLabel}`}
						>
							<line
								x1={PAD}
								y1={H - PAD}
								x2={W - PAD}
								y2={H - PAD}
								className='text-border'
								stroke='currentColor'
								strokeWidth={1}
							/>
							<g className={s.colorClass}>
								<polygon points={area} fill='currentColor' opacity={0.12} />
								<polyline
									points={line}
									fill='none'
									stroke='currentColor'
									strokeWidth={2}
								/>
								<circle
									cx={x(n - 1)}
									cy={y(s.values[n - 1])}
									r={2.5}
									fill='currentColor'
								/>
							</g>
						</svg>
					</div>
				)
			})}
			<div className='text-light-text flex justify-between gap-2 text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<p className='text-light-text text-center text-xs'>Receiver pressure →</p>
		</div>
	)
}

export default BoosterChart

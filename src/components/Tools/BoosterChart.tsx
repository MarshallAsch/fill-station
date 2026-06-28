export interface ChartSeries {
	label: string
	colorClass: string
	values: number[]
	rangeLabel: string
}

// Each series gets its own small-multiple panel with its own y-scale. Points are
// positioned by the shared x array (time), and a couple of y-axis ticks make the
// magnitude readable; the SVG scales uniformly to the container width.
const W = 360
const H = 70
const ML = 34
const MR = 10
const MT = 6
const MB = 6

const PW = W - ML - MR
const PH = H - MT - MB

const fmt = (v: number) => (Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1))

const BoosterChart = ({
	x,
	xLabels,
	xCaption,
	series,
}: {
	x: number[]
	xLabels: string[]
	xCaption: string
	series: ChartSeries[]
}) => {
	const n = series[0]?.values.length ?? 0
	if (n < 2 || x.length !== n) return null
	const xMin = x[0]
	const xMax = x[n - 1]
	const xSpan = xMax - xMin || 1
	const px = (xv: number) => ML + ((xv - xMin) / xSpan) * PW

	return (
		<div className='border-border bg-surface space-y-4 rounded-md border p-4'>
			{series.map((s) => {
				const min = Math.min(...s.values)
				const max = Math.max(...s.values)
				const span = max - min || 1
				const y = (v: number) => MT + PH - ((v - min) / span) * PH
				const line = s.values.map((v, i) => `${px(x[i])},${y(v)}`).join(' ')
				const area = `${px(xMin)},${MT + PH} ${line} ${px(xMax)},${MT + PH}`
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
							{[max, min].map((v, i) => (
								<text
									key={i}
									x={ML - 3}
									y={y(v) + 3}
									textAnchor='end'
									className='text-light-text fill-current'
									fontSize={9}
								>
									{fmt(v)}
								</text>
							))}
							<line
								x1={ML}
								y1={MT}
								x2={ML}
								y2={MT + PH}
								className='text-border'
								stroke='currentColor'
								strokeWidth={1}
							/>
							<line
								x1={ML}
								y1={MT + PH}
								x2={W - MR}
								y2={MT + PH}
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
			<p className='text-light-text text-center text-xs'>{xCaption}</p>
		</div>
	)
}

export default BoosterChart

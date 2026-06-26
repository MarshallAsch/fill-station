export interface AxisSeries {
	label: string
	colorClass: string
	values: number[]
	unit: string
}

const W = 320
const H = 150
const PAD = 8

function scaler(values: number[], h: number) {
	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	return {
		min,
		max,
		y: (v: number) => h - PAD - ((v - min) / span) * (h - 2 * PAD),
	}
}

const DualAxisChart = ({
	x,
	xLabels,
	xCaption,
	left,
	right,
}: {
	x: number[]
	xLabels: string[]
	xCaption: string
	left: AxisSeries
	right: AxisSeries
}) => {
	const n = x.length
	if (n < 2) return null
	const px = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const ls = scaler(left.values, H)
	const rs = scaler(right.values, H)
	const line = (vals: number[], s: ReturnType<typeof scaler>) =>
		vals.map((v, i) => `${px(i)},${s.y(v)}`).join(' ')

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs'>
				<span className={`${left.colorClass} font-semibold`}>
					{left.label} ({Math.round(ls.min)}–{Math.round(ls.max)} {left.unit})
				</span>
				<span className={`${right.colorClass} font-semibold`}>
					{right.label} ({Math.round(rs.min)}–{Math.round(rs.max)} {right.unit})
				</span>
			</div>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label={`${left.label} and ${right.label} vs ${xCaption}`}
			>
				<g className={left.colorClass}>
					<polyline
						points={line(left.values, ls)}
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
					/>
				</g>
				<g className={right.colorClass}>
					<polyline
						points={line(right.values, rs)}
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
						strokeDasharray='4 3'
					/>
				</g>
			</svg>
			<div className='text-light-text flex justify-between gap-2 text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<p className='text-light-text text-center text-xs'>{xCaption}</p>
		</div>
	)
}

export default DualAxisChart

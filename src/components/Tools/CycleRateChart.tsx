const W = 320
const H = 120
const PAD = 8

const CycleRateChart = ({
	xLabels,
	xCaption,
	rates,
	highPerSec,
	lowPerSec,
}: {
	xLabels: string[]
	xCaption: string
	rates: number[]
	highPerSec: number
	lowPerSec: number
}) => {
	const n = rates.length
	if (n < 2) return null
	const max = Math.max(...rates, highPerSec) * 1.1 || 1
	const px = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const y = (v: number) => H - PAD - (v / max) * (H - 2 * PAD)
	const line = rates.map((v, i) => `${px(i)},${y(v)}`).join(' ')
	const area = `${px(0)},${H - PAD} ${line} ${px(n - 1)},${H - PAD}`

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<div className='text-text mb-1 text-xs font-semibold'>
				Cycle rate (cycles/sec)
			</div>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label='Booster cycle rate vs time'
			>
				{/* danger band above 1/sec */}
				<rect
					x={PAD}
					y={y(max)}
					width={W - 2 * PAD}
					height={Math.max(0, y(highPerSec) - y(max))}
					className='text-danger'
					fill='currentColor'
					opacity={0.1}
				/>
				{/* warning band below 1/30 s */}
				<rect
					x={PAD}
					y={y(lowPerSec)}
					width={W - 2 * PAD}
					height={Math.max(0, y(0) - y(lowPerSec))}
					className='text-warning'
					fill='currentColor'
					opacity={0.12}
				/>
				{/* y-axis and x-axis baseline */}
				<line
					x1={PAD}
					y1={PAD}
					x2={PAD}
					y2={H - PAD}
					className='text-border'
					stroke='currentColor'
					strokeWidth={1}
				/>
				<line
					x1={PAD}
					y1={H - PAD}
					x2={W - PAD}
					y2={H - PAD}
					className='text-border'
					stroke='currentColor'
					strokeWidth={1}
				/>
				<g className='text-accent'>
					<polygon points={area} fill='currentColor' opacity={0.1} />
					<polyline
						points={line}
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
					/>
					<circle
						cx={px(n - 1)}
						cy={y(rates[n - 1])}
						r={2.5}
						fill='currentColor'
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

export default CycleRateChart

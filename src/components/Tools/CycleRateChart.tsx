import { ChartMarker } from './DualAxisChart'

const W = 360
const H = 140
const ML = 34
const MR = 12
const MT = 16
const MB = 10

const PW = W - ML - MR
const PH = H - MT - MB

const CycleRateChart = ({
	x,
	xLabels,
	xCaption,
	rates,
	highPerSec,
	lowPerSec,
	markers = [],
}: {
	x: number[]
	xLabels: string[]
	xCaption: string
	rates: number[]
	highPerSec: number
	lowPerSec: number
	markers?: ChartMarker[]
}) => {
	const n = rates.length
	if (n < 2) return null
	const max = Math.max(...rates, highPerSec) * 1.1 || 1
	const xMin = x[0]
	const xMax = x[n - 1]
	const xSpan = xMax - xMin || 1
	const px = (xv: number) => ML + ((xv - xMin) / xSpan) * PW
	const y = (v: number) => MT + PH - (v / max) * PH
	const line = rates.map((v, i) => `${px(x[i])},${y(v)}`).join(' ')
	const area = `${px(xMin)},${MT + PH} ${line} ${px(xMax)},${MT + PH}`
	const yTicks = [max, highPerSec, lowPerSec]

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
					x={ML}
					y={y(max)}
					width={PW}
					height={Math.max(0, y(highPerSec) - y(max))}
					className='text-danger'
					fill='currentColor'
					opacity={0.1}
				/>
				{/* warning band below 1/30 s */}
				<rect
					x={ML}
					y={y(lowPerSec)}
					width={PW}
					height={Math.max(0, y(0) - y(lowPerSec))}
					className='text-warning'
					fill='currentColor'
					opacity={0.12}
				/>
				{/* y-axis tick labels */}
				{yTicks.map((v, i) => (
					<text
						key={`y${i}`}
						x={ML - 3}
						y={y(v) + 3}
						textAnchor='end'
						className='text-light-text fill-current'
						fontSize={9}
					>
						{v < 1 ? v.toFixed(2) : v.toFixed(1)}
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
				{/* event markers (booster on, compressor on) */}
				{markers.map((m, i) => (
					<g key={`m${i}`} className={m.colorClass}>
						<line
							x1={px(m.x)}
							y1={MT}
							x2={px(m.x)}
							y2={MT + PH}
							stroke='currentColor'
							strokeWidth={1}
							strokeDasharray='2 2'
							opacity={0.8}
						/>
						<text
							x={px(m.x)}
							y={MT - 5}
							textAnchor='middle'
							className='fill-current'
							fontSize={8}
						>
							{m.label}
						</text>
					</g>
				))}
				<g className='text-accent'>
					<polygon points={area} fill='currentColor' opacity={0.1} />
					<polyline
						points={line}
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
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

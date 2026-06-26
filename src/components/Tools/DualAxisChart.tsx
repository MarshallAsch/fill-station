export interface AxisSeries {
	label: string
	colorClass: string
	values: number[]
	unit: string
}

export interface ChartMarker {
	x: number
	label: string
	colorClass: string
}

const W = 360
const H = 170
const ML = 38 // left margin for y-axis tick labels
const MR = 40 // right margin for y-axis tick labels
const MT = 14 // top margin (marker labels)
const MB = 10

const PW = W - ML - MR
const PH = H - MT - MB

function scale(values: number[]) {
	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	return { min, max, y: (v: number) => MT + PH - ((v - min) / span) * PH }
}

const fmt = (v: number) => (Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1))

const DualAxisChart = ({
	x,
	xLabels,
	xCaption,
	left,
	right,
	extra,
	markers = [],
}: {
	x: number[]
	xLabels: string[]
	xCaption: string
	left: AxisSeries
	right: AxisSeries
	// Optional third line on its own 0–100% scale (e.g. drive-gas buffer pressure).
	extra?: { label: string; colorClass: string; valuesFrac: number[] }
	markers?: ChartMarker[]
}) => {
	const n = x.length
	if (n < 2) return null
	const xMin = x[0]
	const xMax = x[n - 1]
	const xSpan = xMax - xMin || 1
	const px = (xv: number) => ML + ((xv - xMin) / xSpan) * PW
	const ls = scale(left.values)
	const rs = scale(right.values)
	const line = (vals: number[], y: (v: number) => number) =>
		vals.map((v, i) => `${px(x[i])},${y(v)}`).join(' ')
	const area = (vals: number[], y: (v: number) => number) =>
		`${px(xMin)},${MT + PH} ${line(vals, y)} ${px(xMax)},${MT + PH}`
	const ticks = (s: ReturnType<typeof scale>) => [
		s.max,
		(s.max + s.min) / 2,
		s.min,
	]

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs'>
				<span className={`${left.colorClass} font-semibold`}>
					{left.label} ({left.unit})
				</span>
				{extra && (
					<span className={`${extra.colorClass} font-semibold`}>
						{extra.label} (% of cut-out)
					</span>
				)}
				<span className={`${right.colorClass} font-semibold`}>
					{right.label} ({right.unit})
				</span>
			</div>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label={`${left.label} and ${right.label} vs ${xCaption}`}
			>
				{/* left/right y-axis tick labels + frame */}
				{ticks(ls).map((v, i) => (
					<text
						key={`l${i}`}
						x={ML - 3}
						y={ls.y(v) + 3}
						textAnchor='end'
						className={`${left.colorClass} fill-current`}
						fontSize={9}
					>
						{fmt(v)}
					</text>
				))}
				{ticks(rs).map((v, i) => (
					<text
						key={`r${i}`}
						x={W - MR + 3}
						y={rs.y(v) + 3}
						textAnchor='start'
						className={`${right.colorClass} fill-current`}
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
					className={left.colorClass}
					stroke='currentColor'
					strokeWidth={1}
					opacity={0.5}
				/>
				<line
					x1={W - MR}
					y1={MT}
					x2={W - MR}
					y2={MT + PH}
					className={right.colorClass}
					stroke='currentColor'
					strokeWidth={1}
					opacity={0.5}
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
				{/* event markers (e.g. booster stall) */}
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
							y={MT - 4}
							textAnchor='middle'
							className='fill-current'
							fontSize={8}
						>
							{m.label}
						</text>
					</g>
				))}
				{extra && (
					<g className={extra.colorClass}>
						<polyline
							points={extra.valuesFrac
								.map((f, i) => `${px(x[i])},${MT + PH - f * PH}`)
								.join(' ')}
							fill='none'
							stroke='currentColor'
							strokeWidth={1.5}
							strokeDasharray='1 2'
						/>
					</g>
				)}
				<g className={left.colorClass}>
					<polygon
						points={area(left.values, ls.y)}
						fill='currentColor'
						opacity={0.1}
					/>
					<polyline
						points={line(left.values, ls.y)}
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
					/>
				</g>
				<g className={right.colorClass}>
					<polyline
						points={line(right.values, rs.y)}
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

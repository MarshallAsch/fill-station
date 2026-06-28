export interface CylinderView {
	label: string
	volumeL: number
	startP: number
	endP: number
	maxP: number
	colorClass: string
}

const W = 360
const H = 180
const PAD = 18
const GAP = 10

// Cylinders sized by water volume (height) and filled to their pressure, with a
// start-pressure mark and a pressure label. Static; recomputed each render.
const CascadeCylinders = ({
	cylinders,
	unit,
}: {
	cylinders: CylinderView[]
	unit: string
}) => {
	const n = cylinders.length
	if (n === 0) return null
	const maxVol = Math.max(...cylinders.map((c) => c.volumeL), 1)
	const maxP = Math.max(...cylinders.map((c) => c.maxP), 1)
	const colW = (W - 2 * PAD - (n - 1) * GAP) / n
	const plotH = H - 2 * PAD

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label='Cascade cylinder pressures'
			>
				{cylinders.map((c, i) => {
					// Height scaled by volume, clamped so small bottles stay visible.
					const hFrac = 0.45 + 0.55 * (c.volumeL / maxVol)
					const cylH = plotH * hFrac
					const x = PAD + i * (colW + GAP)
					const yTop = H - PAD - cylH
					const fill = Math.max(0, Math.min(1, c.endP / maxP))
					const fillH = cylH * fill
					const startY =
						H - PAD - cylH * Math.max(0, Math.min(1, c.startP / maxP))
					return (
						<g key={i} className={c.colorClass}>
							<rect
								x={x}
								y={H - PAD - fillH}
								width={colW}
								height={fillH}
								fill='currentColor'
								opacity={0.85}
								rx={3}
							/>
							<rect
								x={x}
								y={yTop}
								width={colW}
								height={cylH}
								fill='none'
								stroke='currentColor'
								strokeWidth={1.5}
								rx={3}
							/>
							{/* start-pressure mark */}
							<line
								x1={x}
								y1={startY}
								x2={x + colW}
								y2={startY}
								className='text-light-text'
								stroke='currentColor'
								strokeWidth={1}
								strokeDasharray='3 2'
							/>
							<text
								x={x + colW / 2}
								y={yTop - 4}
								textAnchor='middle'
								className='fill-current'
								fontSize={9}
							>
								{Math.round(c.startP)}→{Math.round(c.endP)}
							</text>
							<text
								x={x + colW / 2}
								y={H - PAD + 12}
								textAnchor='middle'
								className='text-light-text fill-current'
								fontSize={9}
							>
								{c.label}
							</text>
						</g>
					)
				})}
			</svg>
			<p className='text-light-text text-center text-xs'>
				Cylinder fill (start → after transfer), {unit}; height ∝ volume
			</p>
		</div>
	)
}

export default CascadeCylinders

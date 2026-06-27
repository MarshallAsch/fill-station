'use client'

import { useUnits } from './UnitsProvider'

// Cold-target → hot-fill note: "Fill hot to X; settles to your Y target".
// `cold`/`hot` are display pressure units; `deltaTDisplay` is an optional
// estimated rise in the display temperature unit (nitrox).
const HotFillNote = ({
	cold,
	hot,
	deltaTDisplay,
}: {
	cold: number
	hot: number
	deltaTDisplay?: number
}) => {
	const { units } = useUnits()
	if (hot <= cold + 1e-6) return null
	return (
		<div className='text-text space-y-1'>
			<p>
				Fill hot to:{' '}
				<span className='font-semibold'>
					{Math.round(hot)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>
					so it settles to your {Math.round(cold)} {units.pressure} target
				</span>
			</p>
			{deltaTDisplay != null && deltaTDisplay > 0 && (
				<p className='text-light-text text-sm'>
					Estimated gas temperature rise from the fill rate: +
					{Math.round(deltaTDisplay)} °{units.temp}
				</p>
			)}
		</div>
	)
}

export default HotFillNote

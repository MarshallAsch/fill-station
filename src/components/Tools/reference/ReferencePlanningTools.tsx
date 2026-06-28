import Formula from './Formula'
import { AIR_FN2 } from '@/lib/diveMath/units'
import {
	O2_DENSITY,
	N2_DENSITY,
	HE_DENSITY,
	RECOMMENDED_MAX_DENSITY,
	HARD_MAX_DENSITY,
} from '@/lib/diveMath/gasDensity'
import {
	CNS_TABLE,
	OTU_THRESHOLD_PPO2,
	OTU_EXPONENT,
	CNS_HALF_LIFE_MIN,
} from '@/lib/diveMath/oxygenExposure'
import { HEAT_COEFF } from '@/lib/diveMath/temperature'
import { depthPerBar } from '@/lib/diveMath/modEnd'

const ReferencePlanningTools = () => {
	const cnsRows = CNS_TABLE.map(([p, m]) => `${p}→${m}`).join('  ')
	const cnsLow = CNS_TABLE[0][0]
	const cnsHigh = CNS_TABLE[CNS_TABLE.length - 1]

	return (
		<section className='mb-8'>
			<h2 className='text-text mb-3 text-xl font-semibold'>Planning tools</h2>

			<h3 className='text-text mt-4 font-semibold'>MOD / END</h3>
			<p className='text-text text-sm'>
				Maximum Operating Depth for a ppO₂ ceiling, and Equivalent Narcotic
				Depth for a mix at a planned depth.
			</p>
			<Formula>{`MOD (m) = (ppO₂_limit / fO₂ − 1) × d₀          (ppO₂ = fO₂ × ATA)

END, N₂-only model:     END (m) = (depth + d₀) × (fN₂ / ${AIR_FN2}) − d₀
END, O₂-narcotic model: END (m) = (depth + d₀) × (1 − fHe) − d₀
  fN₂ = 1 − fO₂ − fHe`}</Formula>
			<p className='text-light-text text-sm'>
				Reference: Dalton&apos;s law (ppO₂); narcotic-depth conventions (N₂-only
				vs O₂ also narcotic).
			</p>

			<h3 className='text-text mt-4 font-semibold'>Best Mix</h3>
			<p className='text-text text-sm'>
				The richest O₂ fraction allowed at a depth, and the He fraction for a
				target END — the inverse of MOD/END.
			</p>
			<Formula>{`bestFO₂ = min(1, ppO₂_limit / ATA)
bestFHe = max(0, 1 − (targetEND + d₀) / (depth + d₀))   (N₂-only END)
fN₂     = max(0, 1 − fO₂ − fHe)`}</Formula>
			<p className='text-light-text text-sm'>
				Reference: inverse of MOD / END (Dalton&apos;s law; narcosis
				convention).
			</p>

			<h3 className='text-text mt-4 font-semibold'>EAD</h3>
			<p className='text-text text-sm'>
				Equivalent Air Depth — the air depth with the same N₂ partial pressure,
				for looking up air decompression tables.
			</p>
			<Formula>{`EAD (m) = (depth + d₀) × (fN₂ / ${AIR_FN2}) − d₀     (fN₂ = 1 − fO₂ − fHe)`}</Formula>
			<p className='text-light-text text-sm'>
				Reference: standard Equivalent Air Depth formula.
			</p>

			<h3 className='text-text mt-4 font-semibold'>Gas Density</h3>
			<p className='text-text text-sm'>
				Breathing-gas density at depth, flagging mixes over the recommended and
				hard limits.
			</p>
			<Formula>{`component densities (0 °C, 1 atm): O₂ ${O2_DENSITY}, N₂ ${N2_DENSITY}, He ${HE_DENSITY} g/L
ρ_surface = fO₂·${O2_DENSITY} + fN₂·${N2_DENSITY} + fHe·${HE_DENSITY}
ρ_depth   = ρ_surface × ATA
depthForDensity = (ρ_target / ρ_surface − 1) × d₀
limits: recommended ≤ ${RECOMMENDED_MAX_DENSITY} g/L, hard ≤ ${HARD_MAX_DENSITY} g/L`}</Formula>
			<p className='text-light-text text-sm'>
				Reference: gas density scales with absolute pressure; the{' '}
				{RECOMMENDED_MAX_DENSITY} g/L recommended and {HARD_MAX_DENSITY} g/L
				hard limits per Anthony &amp; Mitchell, widely cited in technical-diving
				guidance.
			</p>

			<h3 className='text-text mt-4 font-semibold'>CNS / OTU</h3>
			<p className='text-text text-sm'>
				Cumulative oxygen toxicity across a day: CNS clock percentage and
				pulmonary OTUs over multiple dive segments and surface intervals.
			</p>
			<Formula>{`NOAA single-exposure CNS limits (ppO₂ ata → max minutes):
  ${cnsRows}
  (linear interpolation between rows; < ${cnsLow} → no limit; ≥ ${cnsHigh[0]} → ${cnsHigh[1]})
segment CNS% = minutes / limit × 100
OTU = minutes × ((ppO₂ − ${OTU_THRESHOLD_PPO2}) / ${OTU_THRESHOLD_PPO2})^${OTU_EXPONENT}      (0 when ppO₂ ≤ ${OTU_THRESHOLD_PPO2})
surface interval: CNS ×= 0.5^(surfaceMin / ${CNS_HALF_LIFE_MIN})   (${CNS_HALF_LIFE_MIN}-min half-time)`}</Formula>
			<p className='text-light-text text-sm'>
				Reference: NOAA Diving Manual — oxygen exposure limits, the CNS clock
				and 90-minute half-time, and the OTU / UPTD power formula.
			</p>

			<h3 className='text-text mt-4 font-semibold'>Gas Requirements</h3>
			<p className='text-text text-sm'>
				Surface gas consumption (SAC/RMV) from a logged dive (or entered
				directly), planned-segment gas, and the rock-bottom reserve to bring a
				team up safely.
			</p>
			<Formula>{`SAC (bar/min)   = (startP − endP) / minutes / ATA(avgDepth)
RMV (L/min)     = SAC × tankVolume
gas needed (L)  = RMV × ATA(depth) × minutes
rock-bottom (L) = teamSize × [ stressedRMV × ATA(depth/2) × (depth / ascentRate)
                             + Σ stressedRMV × ATA(stopDepth) × stopMinutes ]
                  stressedRMV = RMV × stressFactor
min gas (bar)   = minGasL / tankVolume`}</Formula>
			<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
				<li>The stress factor multiplies RMV for the emergency ascent only.</li>
			</ul>
			<p className='text-light-text text-sm'>
				Reference: standard SAC/RMV definitions; rock-bottom / minimum-gas
				reserve planning (technical-diving convention).
			</p>

			<hr className='border-border my-6' />
			<h2 className='text-text mb-2 text-xl font-semibold'>
				Approximations &amp; limitations
			</h2>
			<ul className='text-light-text my-2 list-disc space-y-1 pl-5 text-sm'>
				<li>
					Real gas uses a first-order linear Z fit, not a virial / NIST model.
				</li>
				<li>
					Hot-fill heating uses a single {HEAT_COEFF} °C per (bar/min){' '}
					coefficient.
				</li>
				<li>
					Fresh water uses d₀ = {depthPerBar('fresh')} m/bar; salt uses{' '}
					{depthPerBar('salt')}.
				</li>
				<li>
					The booster uses numeric (trapezoidal) integration and a geometric
					swept-volume estimate.
				</li>
				<li>All results are estimates — verify independently before diving.</li>
			</ul>
		</section>
	)
}

export default ReferencePlanningTools

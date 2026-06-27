import Formula from './Formula'

const ReferenceBlendingTools = () => (
	<section className='mb-8'>
		<h2 className='text-text mb-3 text-xl font-semibold'>Blending tools</h2>

		<h3 className='text-text mt-4 font-semibold'>Cascade Fill</h3>
		<p className='text-text text-sm'>
			Fills a cylinder from a bank of storage bottles, lowest-pressure bottle
			first, by free equalization (no pump). Each bottle equalizes with the
			cylinder until pressures meet.
		</p>
		<Formula>{`Per bank (skipped if bank ≤ target), mole-weighted mean:
ideal:    eqAbs = (P_target_abs·V_target + P_bank_abs·V_bank) / (V_target + V_bank)
real gas: w = V / Z(air, P_abs)
          eqAbs = (P_target_abs·w_target + P_bank_abs·w_bank) / (w_target + w_bank)
P_final = eqAbs − 1.01325`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Banks used lowest-pressure first to preserve high-pressure gas.</li>
			<li>Air assumed (fO₂ = 0.209) for the compressibility weighting.</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: conservation of moles on free equalization; real gas via
			Fundamentals.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Nitrox Stick</h3>
		<p className='text-text text-sm'>
			Continuous blending: how much pure O₂ to bleed into an air stream for a
			target nitrox fraction, and the O₂ drawn from supply for a fill.
		</p>
		<Formula>{`O₂ flow      = airFlow × (targetFO₂ − 0.209) / (1 − targetFO₂)
added (surface L) = tankVol × (finalP − startP)
O₂ fraction  = (targetFO₂ − 0.209) / (1 − 0.209)
O₂ volume    = added × O₂ fraction
supply drop  = O₂ volume / supplyVol`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Returns 0 when the target ≤ 0.209 (no enrichment needed).</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: partial pressure of O₂ added to air (Dalton&apos;s law).
		</p>

		<h3 className='text-text mt-4 font-semibold'>Blend (PP)</h3>
		<p className='text-text text-sm'>
			Partial-pressure blend to a target O₂/He mix: solves for the pure-O₂ and
			pure-He pressures to add, then tops up with air or a chosen travel gas.
		</p>
		<Formula>{`pi = start pressure   pf = final pressure   rem = pf − pi
bHe = targetFhe·pf − startFhe·pi − topFhe·rem
bO₂ = targetFo2·pf − startFo2·pi − topFo2·rem
det = (1 − topFhe)(1 − topFo2) − (topFhe)(topFo2)
pHe = ( bHe·(1 − topFo2) + topFhe·bO₂ ) / det
pO₂ = ( (1 − topFhe)·bO₂ + topFo2·bHe ) / det
real gas:  pHe ×= Z(He, pf)   pO₂ ×= Z(O₂, pf)   (pf = final pressure)
pTop = pf − pi − pHe − pO₂`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>
				Infeasible if |det| &lt; 1e-9 (top-up gas can&apos;t reach the target)
				or any of pHe / pO₂ / pTop &lt; 0 (would require draining the cylinder).
			</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: Dalton&apos;s law of partial pressures; partial-pressure
			blending.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Topping Up</h3>
		<p className='text-text text-sm'>
			Given a starting gas and a top-up gas filled to a target pressure, the
			resulting mix — a mole-weighted blend of the two.
		</p>
		<Formula>{`finalMix = r·startMix + (1 − r)·topMix
  r = start gas's share of the final gas content
ideal:    r = startAbs / finalAbs
real gas: content ∝ P_abs / Z
          r = (startAbs / Z_start) / (finalAbs / Z_final)
          solved by a 10-step fixed point (Z_final depends on the final mix)`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>If final ≤ start, nothing is added and the start mix is returned.</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: Dalton&apos;s law; real gas via Fundamentals.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Blending Cost</h3>
		<p className='text-text text-sm'>
			Prices a partial-pressure blend by multiplying each component&apos;s
			consumed gas volume (O₂, He, top-up) from the Blend (PP) result by its
			unit price. No separate dive-math model — see Blend (PP) for the volumes.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Booster</h3>
		<p className='text-text text-sm'>
			Models an air-driven O₂ booster pump: free equalization first, then the
			drive-air consumed, fill time, and cycle rate for the boosted portion.
		</p>
		<Formula>{`maxOutput = ratio × driveP            (stall ceiling; infeasible if target > maxOutput)
free equalization (supply ⇄ receiver), mole-weighted like Cascade
drive air for q surface L (trapezoidal integral, 400 steps):
  receiverAbs(x) = boostStart_abs + x / receiverVol
  inletAbs(x)    = min(supplyStart_abs − x / supplyVol, cap)
  integrand(x)   = (receiverAbs/inletAbs) × Z(inletAbs)/Z(receiverAbs)
  driveAirL = ∫₀^q integrand dx
gasPerCycle  = ((driveSwept/ratio) × (supplyAbs/1.01325)) / Z_supply
boosterRate  = maxCpm · gasPerCycle / receiverVol
fillTime     = equalization time + boost time   (both rate-limited)`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Drive pressure ramps to only what the back-pressure needs.</li>
			<li>
				Fill is capped at the max O₂ fill rate; an undersized storage buffer +
				compressor can stall the pump.
			</li>
			<li>
				<span className='font-medium'>Approximation:</span> trapezoidal numeric
				integration; geometric swept-volume estimate.
			</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: real-gas law; pump displacement ratio; mole balance on
			transfer.
		</p>
	</section>
)

export default ReferenceBlendingTools

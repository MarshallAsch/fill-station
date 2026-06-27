import Formula from './Formula'

const ReferenceFundamentals = () => (
	<section className='mb-8'>
		<h2 className='text-text mb-3 text-xl font-semibold'>Fundamentals</h2>
		<p className='text-light-text mb-4 text-sm'>
			Shared models the tools build on. All internal math is SI (bar, metres,
			litres, °C); values convert to your chosen units only for display.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Units &amp; constants</h3>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Atmospheric pressure: 1.01325 bar (gauge = absolute − 1.01325).</li>
			<li>Air: O₂ = 0.209, N₂ = 0.791.</li>
			<li>
				Conversions: 14.5037738 psi/bar · 28.3168466 L/ft³ · 3.280839895 ft/m.
			</li>
		</ul>

		<h3 className='text-text mt-4 font-semibold'>Depth ↔ pressure</h3>
		<Formula>{`d₀ = 10 m/bar (salt water), 10.3 m/bar (fresh)
ATA = depth_m / d₀ + 1`}</Formula>
		<p className='text-light-text text-sm'>
			ATA is the absolute pressure at depth in atmospheres. Reference:
			hydrostatic pressure (~1 bar per 10 m of seawater).
		</p>

		<h3 className='text-text mt-4 font-semibold'>
			Real-gas compressibility (Z)
		</h3>
		<Formula>{`PV = Z·nRT          (Z = 1 for an ideal gas)
Z(P) = 1 + k·P      (P in absolute bar)
  k_O₂ = −0.0002   k_N₂ = +0.0002   k_He = +0.00025
Z_mix = fO₂·Z_O₂ + fHe·Z_He + fN₂·Z_N₂   (fN₂ = 1 − fO₂ − fHe)
gas content ∝ P_abs / Z`}</Formula>
		<p className='text-light-text text-sm'>
			Applied when the global real-gas setting is on. At ~200 bar O₂ ≈ 0.96, N₂
			≈ 1.04, He ≈ 1.05, dry air ≈ 1.03 — so a nominal AL80 (11.1 L × 207 bar)
			reads ~77–79 ft³ rather than the ideal 81.{' '}
			<span className='font-medium'>Approximation:</span> a first-order linear
			fit to published Z data near room temperature, not a full virial / NIST /
			AGA8 model. Reference: real-gas law, compressibility-factor tables for
			O₂/N₂/He.
		</p>

		<h3 className='text-text mt-4 font-semibold'>
			Temperature &amp; hot fills
		</h3>
		<Formula>{`Gay-Lussac (fixed volume):  P / T = constant   (T in kelvin, K = 273.15)
Settle on cooling:  P_cold_abs = P_hot_abs × (T_cold / T_hot)
Fill hot to target: P_hot_abs  = P_cold_abs × (T_hot / T_cold)
Fill-rate heating:  ΔT = 0.7 × fillRate(bar/min)   (≥ 0)`}</Formula>
		<p className='text-light-text text-sm'>
			With temperatures set, a fill is computed to the hot pressure that settles
			to your cold target; &quot;simple&quot; mode uses a flat overfill %
			instead. <span className='font-medium'>Approximation:</span> the 0.7 °C
			per (bar/min) coefficient rolls cylinder thermal mass into one constant.
			Reference: Gay-Lussac&apos;s / combined gas law.
		</p>
	</section>
)

export default ReferenceFundamentals

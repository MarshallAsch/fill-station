import Link from 'next/link'
import { GROUPS, TOOLS } from '@/components/Tools/toolsRegistry'

export default function ToolsAboutPage() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Link href='/tools' className='text-accent text-sm underline'>
				← Back to tools
			</Link>
			<h1 className='text-text mt-4 mb-2 text-3xl font-bold'>
				About the Dive Tools
			</h1>
			<div className='border-border bg-hover text-text mb-6 rounded-md border p-3 text-sm'>
				<span className='font-semibold'>For reference only.</span> All results
				are estimates — independently verify and analyze every gas mix and dive
				plan before diving.
			</div>
			<p className='mb-6 text-sm'>
				<Link href='/tools/reference' className='text-accent underline'>
					Equations &amp; references →
				</Link>
			</p>

			{GROUPS.map((g) => (
				<section key={g.id} className='mb-6'>
					<h2 className='text-text mb-2 text-xl font-semibold'>{g.name}</h2>
					<dl className='space-y-2'>
						{TOOLS.filter((t) => t.group === g.id).map((t) => (
							<div key={t.id}>
								<dt className='text-text font-medium'>{t.name}</dt>
								<dd className='text-light-text text-sm'>{t.description}</dd>
							</div>
						))}
					</dl>
				</section>
			))}

			<hr className='border-border my-8' />
			<h2 className='text-text mb-2 text-xl font-semibold'>
				How it works &amp; decisions made
			</h2>
			<div className='text-text space-y-4 text-sm'>
				<div>
					<h3 className='text-text font-semibold'>Real gas vs ideal gas</h3>
					<p>
						Gas amounts use the compressibility factor Z (PV = ZnRT), not just
						the ideal PV = nRT. A first-order linear Z (O₂ ≈ 0.96, N₂ ≈ 1.04, He
						≈ 1.05 at 200 bar) is applied when the global real-gas setting is on
						— which is why a nominal AL80 (11.1 L × 3000 psi) reads ~77 cf, not
						the ideal 81. It&apos;s a reference-grade approximation, not a full
						virial/NIST model.
					</p>
				</div>
				<div>
					<h3 className='text-text font-semibold'>Temperature / hot fills</h3>
					<p>
						A cylinder fills hot and loses pressure as it cools (Gay-Lussac: P/T
						constant at fixed volume). With temperatures set, the tools show the
						pressure a fill settles to once cool and the hot pressure to fill to
						so it settles at the target; the simple mode uses a flat overfill
						percentage instead.
					</p>
				</div>
				<div>
					<h3 className='text-text font-semibold'>Booster model</h3>
					<p>
						The drive pressure ramps to only what the back-pressure needs (≈
						receiver pressure ÷ ratio), so drive air is the receiver/supply
						pressure ratio integrated over the fill, not the stall-pressure
						estimate. Fill time is rate-limited (max O₂ fill rate). Cycle rate
						comes from the air-drive swept volume per stroke; a storage buffer +
						compressor can stall the booster if undersized.
					</p>
				</div>
				<div>
					<h3 className='text-text font-semibold'>Data sources</h3>
					<p>
						Cylinder water volumes and pressures: Luxfer / Catalina (aluminum,
						3000 psi), Faber / Worthington (HP steel, 3442 psi), UN / industrial
						T &amp; K bottles. Boosters: Haskel AG (one shared 5.75″ air-drive
						head across the series), USUN (drive-air derived from bore ×
						stroke). All cylinder/booster figures are starting estimates you can
						edit.
					</p>
				</div>
			</div>
		</div>
	)
}

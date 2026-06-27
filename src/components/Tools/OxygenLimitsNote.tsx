import { CNS_TABLE } from '@/lib/diveMath/oxygenExposure'

const OxygenLimitsNote = () => (
	<aside className='border-border bg-surface h-fit rounded-md border p-4'>
		<h3 className='text-text mb-3 text-sm font-semibold'>
			Standard O₂ exposure limits (NOAA)
		</h3>
		<dl className='space-y-1 text-sm'>
			<dt className='text-light-text text-xs font-medium'>
				Single exposure (ppO₂ → max minutes)
			</dt>
			{CNS_TABLE.map(([ppo2, minutes]) => (
				<dd key={ppo2} className='text-text'>
					{ppo2.toFixed(1)} ata → {minutes} min
				</dd>
			))}
		</dl>
		<p className='text-light-text mt-3 text-xs'>
			Daily CNS: plan to ~80%, 100% limit. Daily OTU: ~300 (single day).
			Reference only — verify against current tables.
		</p>
	</aside>
)

export default OxygenLimitsNote

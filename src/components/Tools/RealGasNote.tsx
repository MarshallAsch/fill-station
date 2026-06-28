// Sidebar card explaining real-gas vs ideal-gas, with external references.
const RealGasNote = () => {
	return (
		<aside className='border-border bg-surface h-fit rounded-md border p-4'>
			<h3 className='text-text mb-3 text-sm font-semibold'>
				Real gas vs ideal gas
			</h3>
			<div className='text-text space-y-2 text-sm'>
				<p>
					The ideal-gas law (PV = nRT) assumes gas amount scales linearly with
					pressure. At cylinder pressures that&apos;s off by a few percent: a
					real gas is described by{' '}
					<span className='font-medium'>PV = ZnRT</span>, where the
					compressibility factor <span className='font-medium'>Z</span> depends
					on the gas and pressure.
				</p>
				<p>
					Near 200 bar and room temperature, Z ≈ 0.96 for O₂, ≈ 1.04 for N₂, and
					≈ 1.05 for He — so an &ldquo;AL80&rdquo; really holds ~77 cf, not the
					81 the ideal estimate gives. Helium-rich mixes hold even less per bar
					than ideal.
				</p>
				<p className='text-light-text text-xs'>
					This tool uses a first-order linear approximation of Z (reference
					only). The global &ldquo;real-gas&rdquo; toggle applies it across
					every tool.
				</p>
				<ul className='text-accent mt-1 space-y-1 text-xs'>
					<li>
						<a
							href='https://en.wikipedia.org/wiki/Compressibility_factor'
							target='_blank'
							rel='noopener noreferrer'
							className='underline'
						>
							Compressibility factor (Wikipedia)
						</a>
					</li>
					<li>
						<a
							href='https://en.wikipedia.org/wiki/Real_gas'
							target='_blank'
							rel='noopener noreferrer'
							className='underline'
						>
							Real gas (Wikipedia)
						</a>
					</li>
					<li>
						<a
							href='https://en.wikipedia.org/wiki/Van_der_Waals_equation'
							target='_blank'
							rel='noopener noreferrer'
							className='underline'
						>
							Van der Waals equation (Wikipedia)
						</a>
					</li>
				</ul>
			</div>
		</aside>
	)
}

export default RealGasNote

export interface FormulaRow {
	label: string
	expr: string
	note?: string
}

const FormulaPanel = ({
	rows,
	title = 'Formulas & values',
}: {
	rows: FormulaRow[]
	title?: string
}) => {
	return (
		<aside className='border-border bg-surface h-fit rounded-md border p-4'>
			<h3 className='text-text mb-3 text-sm font-semibold'>{title}</h3>
			<dl className='space-y-3'>
				{rows.map((row, i) => (
					<div key={i}>
						<dt className='text-light-text text-xs font-medium'>{row.label}</dt>
						<dd className='text-text mt-0.5 font-mono text-xs break-words'>
							{row.expr}
						</dd>
						{row.note && (
							<dd className='text-light-text mt-0.5 text-xs italic'>
								{row.note}
							</dd>
						)}
					</div>
				))}
			</dl>
			<p className='text-light-text mt-4 text-xs italic'>
				Depths are converted to metres for the formulas (D₀ = 10 m/bar salt,
				10.3 m/bar fresh).
			</p>
		</aside>
	)
}

export default FormulaPanel

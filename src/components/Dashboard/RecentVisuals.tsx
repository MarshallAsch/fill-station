import { VisualHistory } from '@/types/visuals'

const RecentVisuals = ({ visuals }: { visuals: VisualHistory[] }) => {
	if (visuals.length === 0) {
		return (
			<p className='text-light-text text-sm'>No visual inspections found.</p>
		)
	}

	return (
		<div className='flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:outline-white/10'>
						<table className='divide-divider-strong min-w-full divide-y'>
							<thead className='bg-surface'>
								<tr>
									<th className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'>
										Date
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Cylinder
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Status
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
								{visuals.map((visual) => (
									<tr key={visual.id} className='hover:bg-hover'>
										<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium sm:pl-6'>
											{visual.date}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{visual.Cylinder?.serialNumber}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{visual.status}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RecentVisuals

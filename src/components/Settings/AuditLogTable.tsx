type AuditEntry = {
	id: string
	action: string
	entity: string
	entityId: string
	details: object | null
	createdAt: string
	user?: { name: string | null; email: string | null }
}

const AuditLogTable = ({ entries }: { entries: AuditEntry[] }) => {
	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:outline-white/10'>
						<table className='divide-divider-strong relative min-w-full divide-y'>
							<thead className='bg-surface'>
								<tr>
									<th className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'>
										Date
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										User
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Action
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Entity
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Entity ID
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
								{entries.map((entry) => (
									<tr key={entry.id} className='hover:bg-hover'>
										<td className='text-light-text py-4 pr-3 pl-4 text-center text-sm sm:pl-6'>
											{new Date(entry.createdAt).toLocaleString()}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{entry.user?.name ?? entry.user?.email ?? '—'}
										</td>
										<td className='text-text px-3 py-4 text-center text-sm font-medium'>
											{entry.action}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{entry.entity}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{entry.entityId}
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

export default AuditLogTable

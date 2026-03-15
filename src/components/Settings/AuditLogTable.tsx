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
						<table className='relative min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-800'>
								<tr>
									<th className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'>
										Date
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										User
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										Action
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										Entity
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										Entity ID
									</th>
								</tr>
							</thead>
							<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
								{entries.map((entry) => (
									<tr
										key={entry.id}
										className='hover:bg-gray-100 dark:hover:bg-gray-800'
									>
										<td className='py-4 pr-3 pl-4 text-center text-sm text-gray-500 sm:pl-6 dark:text-gray-400'>
											{new Date(entry.createdAt).toLocaleString()}
										</td>
										<td className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
											{entry.user?.name ?? entry.user?.email ?? '—'}
										</td>
										<td className='px-3 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100'>
											{entry.action}
										</td>
										<td className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
											{entry.entity}
										</td>
										<td className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
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

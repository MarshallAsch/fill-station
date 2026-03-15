import ClientsRow from './ClientsRow'
import useLoadClients from '@/hooks/useLoadClients'

const ClientListTable = () => {
	const { clients, status, error } = useLoadClients()

	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='relative min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-800'>
								<tr>
									<th
										scope='col'
										className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'
									>
										Full Name
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Highest Certification
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Details
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
								{clients.map((client) => (
									<ClientsRow key={client.id} client={client} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClientListTable

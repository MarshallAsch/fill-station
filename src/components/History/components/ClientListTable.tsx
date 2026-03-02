import ClientsRow from './ClientsRow'
import useLoadClients from '@/hooks/useLoadClients'

const ClientListTable = () => {
	const { clients, status, error } = useLoadClients()

	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='relative min-w-full divide-y divide-gray-300'>
							<thead className='bg-gray-50'>
								<tr>
									<th
										scope='col'
										className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
									>
										Full Name
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Highest Certification
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Details
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200 bg-white'>
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

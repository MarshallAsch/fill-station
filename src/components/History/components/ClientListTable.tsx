import ClientsRow from './ClientsRow'
import useLoadClients from '@/hooks/useLoadClients'

const ClientListTable = () => {
	const { clients, status, error } = useLoadClients()

	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='divide-divider-strong relative min-w-full divide-y'>
							<thead className='bg-surface'>
								<tr>
									<th
										scope='col'
										className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'
									>
										Full Name
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Highest Certification
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Details
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
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

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useQuery } from '@tanstack/react-query'
import { getAllClients } from '@/app/_api'
import { setClients } from '@/redux/client/clientSlice'
import ClientsRow from './ClientsRow'

function useLoadClients() {
	const { status, data, error } = useQuery({
		queryKey: ['clients'],
		queryFn: getAllClients,
	})

	const dispatch = useAppDispatch()
	const { allClients: clients } = useAppSelector((state) => state.clients)

	if (data) {
		dispatch(setClients(data))
	}

	return { clients, status, error }
}

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

'use client'

import { useMemo, useState } from 'react'
import ClientsRow from './ClientsRow'
import Pagination from '@/components/UI/Pagination'
import TextInput from '@/components/UI/FormElements/TextInput'
import usePagination from '@/hooks/usePagination'
import useLoadClients from '@/hooks/useLoadClients'

const ClientListTable = () => {
	const { clients } = useLoadClients()
	const [search, setSearch] = useState('')

	const filteredClients = useMemo(() => {
		const query = search.trim().toLowerCase()
		if (!query) return clients
		return clients.filter((client) => client.name.toLowerCase().includes(query))
	}, [clients, search])

	const { page, setPage, totalPages, paginatedItems } =
		usePagination(filteredClients)

	return (
		<div className='mt-8 flow-root'>
			<div className='mb-4 px-4 sm:px-6 lg:px-8'>
				<TextInput
					id='client-search'
					name='client-search'
					type='search'
					ariaLabel='Search clients by name'
					placeholder='Search clients by name'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>
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
										className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold sm:table-cell'
									>
										Highest Certification
									</th>
									<th
										scope='col'
										className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold sm:table-cell'
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
								{paginatedItems.map((client) => (
									<ClientsRow key={client.id} client={client} />
								))}
								{paginatedItems.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className='text-light-text px-3 py-6 text-center text-sm'
										>
											No clients found
										</td>
									</tr>
								)}
							</tbody>
						</table>
						<Pagination
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClientListTable

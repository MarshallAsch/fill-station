import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import FillsRow from './FillsRow'
import { addNewFill } from '@/redux/fills/fillsSlice'
import Button from '../UI/Button'
import Pagination from '../UI/Pagination'
import usePagination from '@/hooks/usePagination'
import { Client } from '@/types/client'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

type FillsTableProps = {
	client: Client | null
}

const FillsTable = ({ client }: FillsTableProps) => {
	const fills = useAppSelector((state) => state.fills.fills)
	const dispatch = useAppDispatch()

	const {
		page,
		setPage,
		totalPages,
		paginatedItems: paginatedFills,
	} = usePagination(fills)

	return (
		<div className='w-full px-4 sm:px-6 lg:px-8'>
			<div className='flex justify-end'>
				<div className='sm:mt-0 sm:ml-16 sm:flex-none'>
					<Button onClick={() => dispatch(addNewFill())} variant='ghost'>
						Add Fill
					</Button>
				</div>
				<div className='sm:mt-0 sm:ml-5 sm:flex-none'>
					<Button type='submit'>Submit</Button>
				</div>
			</div>
			<div className='mt-8 flow-root'>
				<div className='-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
					<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
						<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
							<table className='divide-divider-strong relative min-w-full divide-y'>
								<thead className='bg-surface'>
									<tr>
										<th
											scope='col'
											className='text-text py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-6'
										>
											Cylinder
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-left text-sm font-semibold'
										>
											Fill Type
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-left text-sm font-semibold'
										>
											Contents
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-left text-sm font-semibold'
										>
											Start Pressure
										</th>
										<th scope='col' className='py-3.5 pr-4 pl-3 sm:pr-6'>
											End Pressure
										</th>
										<th scope='col' className='py-3.5 pr-4 pl-3 sm:pr-6'></th>
									</tr>
								</thead>
								<tbody className='bg-background divide-divider h-full divide-y'>
									{paginatedFills.map((fill) => (
										<FillsRow
											disableDelete={fills.length === 1}
											key={fill.id}
											fill={fill}
											client={client}
										/>
									))}
									<tr>
										<td
											colSpan={6}
											className='bg-surface text-text h-full py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'
										>
											<div>
												<Button
													onClick={() => dispatch(addNewFill())}
													variant='ghost'
												>
													<PlusCircleIcon className='h-10 w-10' />
												</Button>
											</div>
										</td>
									</tr>
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
		</div>
	)
}

export default FillsTable

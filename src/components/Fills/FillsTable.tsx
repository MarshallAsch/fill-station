import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import FillsRow from './FillsRow'
import { addNewFill } from '@/redux/fills/fillsSlice'
import Button from '../UI/Button'
import { Client } from '@/types/client'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState, useTransition } from 'react'

const ROWS_PER_PAGE = 20

type FillsTableProps = {
	client: Client | null
}

const FillsTable = ({ client }: FillsTableProps) => {
	const fills = useAppSelector((state) => state.fills.fills)

	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

	const dispatch = useAppDispatch()

	const start = (page - 1) * ROWS_PER_PAGE
	const end = start + ROWS_PER_PAGE
	const paginatedFills = fills.slice(start, end)
	const totalPages = Math.ceil(fills.length / ROWS_PER_PAGE)

	useEffect(() => {
		startTransition(() => {
			setPage(1)
		})
	}, [fills.length])

	return (
		<div className='px-4 sm:px-6 lg:px-8'>
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
				<div className='sm:-mx-6 lg:-mx-8'>
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
							<div className='flex items-center justify-between px-4 py-4'>
								<p className='text-light-text text-sm'>
									Page {page} of {totalPages}
								</p>

								<div className='flex gap-2'>
									<Button
										variant='ghost'
										onClick={() => setPage((p) => Math.max(p - 1, 1))}
										disabled={page === 1}
									>
										Previous
									</Button>

									<Button
										variant='ghost'
										onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
										disabled={page >= totalPages}
									>
										Next
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default FillsTable

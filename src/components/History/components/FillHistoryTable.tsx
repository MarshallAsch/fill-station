'use client'

import FillHistoryRow from './FillHistoryRow'
import { useEffect, useState, useTransition } from 'react'
import Button from '@/components/UI/Button'
import useLoadFills from '@/hooks/useLoadFills'
import { FillHistory } from '@/types/fills'

const ROWS_PER_PAGE = 20

type FillHistoryTableProps = {
	fills?: FillHistory[]
}

const FillHistoryTable = ({ fills: propFills }: FillHistoryTableProps = {}) => {
	const { fills: hookFills } = useLoadFills()
	const fills = propFills ?? hookFills

	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

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
		<div className='min-w-full'>
			<div className='mt-8 flow-root'>
				<div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
					<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
						<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
							<table className='divide-divider-strong relative min-w-full divide-y'>
								<thead className='bg-surface'>
									<tr>
										<th
											scope='col'
											className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'
										>
											Date
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-center text-sm font-semibold'
										>
											Mix
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-center text-sm font-semibold'
										>
											Start Pressure
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-center text-sm font-semibold'
										>
											End Pressure
										</th>
										<th
											scope='col'
											className='py-3.5 pr-4 pl-3 text-center sm:pr-6'
										>
											Cylinder
										</th>
									</tr>
								</thead>
								<tbody className='bg-background divide-divider divide-y'>
									{paginatedFills.map((fill) => (
										<FillHistoryRow key={fill.id} fill={fill} />
									))}
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

export default FillHistoryTable

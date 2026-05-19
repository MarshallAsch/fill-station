'use client'

import FillHistoryRow from './FillHistoryRow'
import Pagination from '@/components/UI/Pagination'
import usePagination from '@/hooks/usePagination'
import useLoadFills from '@/hooks/useLoadFills'
import { FillHistory } from '@/types/fills'

type FillHistoryTableProps = {
	fills?: FillHistory[]
}

const FillHistoryTable = ({ fills: propFills }: FillHistoryTableProps = {}) => {
	const { fills: hookFills } = useLoadFills({ enabled: !propFills })
	const fills = propFills ?? hookFills

	const {
		page,
		setPage,
		totalPages,
		paginatedItems: paginatedFills,
	} = usePagination(fills)

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
											className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold sm:table-cell'
										>
											Start Pressure
										</th>
										<th
											scope='col'
											className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold sm:table-cell'
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

export default FillHistoryTable

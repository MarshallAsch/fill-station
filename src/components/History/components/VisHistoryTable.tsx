'use client'

import VisHistoryRow from './VisHistoryRow'
import Pagination from '@/components/UI/Pagination'
import usePagination from '@/hooks/usePagination'
import useLoadVisuals from '@/hooks/useLoadVisuals'
import { VisualHistory } from '@/types/visuals'

type VisHistoryTableProps = {
	visuals?: VisualHistory[]
	hideDetails?: boolean
}

const VisHistoryTable = ({
	visuals: propVisuals,
	hideDetails = false,
}: VisHistoryTableProps = {}) => {
	const { visuals: hookVisuals } = useLoadVisuals({ enabled: !propVisuals })
	const visuals = propVisuals ?? hookVisuals
	const {
		page,
		setPage,
		totalPages,
		paginatedItems: paginatedVisuals,
	} = usePagination(visuals)

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
											Cylinder
										</th>
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-center text-sm font-semibold'
										>
											Passed
										</th>
										<th
											scope='col'
											className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold sm:table-cell'
										>
											Oxygen Clean
										</th>
										{!hideDetails && (
											<th
												scope='col'
												className='text-text px-3 py-3.5 text-center text-sm font-semibold'
											>
												Details
											</th>
										)}
									</tr>
								</thead>
								<tbody className='bg-background divide-divider divide-y'>
									{paginatedVisuals.map((vis) => (
										<VisHistoryRow
											key={vis.id}
											visual={vis}
											hideDetails={hideDetails}
										/>
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

export default VisHistoryTable

'use client'

import { Cylinder } from '@/types/cylinder'
import { Cylinder as CylinderDB } from '@/lib/models/cylinder'

import CylinderListRow from './CylinderListRow'
import CylinderListCard from './CylinderListCard'
import Pagination from '@/components/UI/Pagination'
import usePagination from '@/hooks/usePagination'

type CylinderListProps = {
	cylinders: Array<Cylinder | CylinderDB>
	showOwner?: boolean
	hideInspection?: boolean
	disableEdit?: boolean
}

const CylinderListTable = ({
	cylinders,
	showOwner = false,
	hideInspection = false,
	disableEdit = false,
}: CylinderListProps) => {
	const {
		page,
		setPage,
		totalPages,
		paginatedItems: paginatedCylinders,
	} = usePagination(cylinders)

	return (
		<div className='mt-8 flow-root'>
			<ul className='border-border divide-divider divide-y overflow-hidden rounded-lg border md:hidden'>
				{paginatedCylinders.map((cylinder) => (
					<CylinderListCard
						key={cylinder.id}
						cylinder={JSON.parse(JSON.stringify(cylinder))}
						showOwner={showOwner}
						hideInspection={hideInspection}
						disableEdit={disableEdit}
					/>
				))}
			</ul>
			<div className='hidden overflow-x-auto md:block'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='divide-divider-strong relative min-w-full divide-y'>
							<thead className='bg-surface'>
								<tr>
									<th scope='col' className='w-10 px-2 py-3.5'>
										<span className='sr-only'>Status</span>
									</th>
									<th
										scope='col'
										className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'
									>
										Cylinder
									</th>
									{showOwner && (
										<th
											scope='col'
											className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'
										>
											Owner
										</th>
									)}
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Oxygen Clean
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Last Hydro
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Last Vis
									</th>
									<th
										scope='col'
										className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold md:table-cell'
									>
										Next Hydro
									</th>
									<th
										scope='col'
										className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold md:table-cell'
									>
										Next Vis
									</th>
									{!hideInspection && (
										<th
											scope='col'
											className='text-text hidden px-3 py-3.5 text-center text-sm font-semibold md:table-cell'
										>
											Do Inspection
										</th>
									)}
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
								{paginatedCylinders.map((cylinder) => (
									<CylinderListRow
										key={cylinder.id}
										cylinder={JSON.parse(JSON.stringify(cylinder))}
										showOwner={showOwner}
										hideInspection={hideInspection}
										disableEdit={disableEdit}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
		</div>
	)
}

export default CylinderListTable

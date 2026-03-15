'use client'

import { Cylinder } from '@/types/cylinder'
import { Cylinder as CylinderDB } from '@/lib/models/cylinder'

import CylinderListRow from './CylinderListRow'
import { useEffect, useState, useTransition } from 'react'
import Button from '@/components/UI/Button'

const ROWS_PER_PAGE = 20

type CylinderListProps = {
	cylinders: Cylinder[] | CylinderDB[]
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
	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

	const start = (page - 1) * ROWS_PER_PAGE
	const end = start + ROWS_PER_PAGE
	const paginatedCylinders = cylinders.slice(start, end)
	const totalPages = Math.ceil(cylinders.length / ROWS_PER_PAGE)

	useEffect(() => {
		startTransition(() => {
			setPage(1)
		})
	}, [cylinders.length])

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
										Serial number
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
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Next Hydro
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Next Vis
									</th>
									{!hideInspection && (
										<th
											scope='col'
											className='text-text px-3 py-3.5 text-center text-sm font-semibold'
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
						{totalPages > 1 && (
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
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default CylinderListTable

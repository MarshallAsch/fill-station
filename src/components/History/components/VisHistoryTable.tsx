import VisHistoryRow from './VisHistoryRow'
import { useEffect, useState, useTransition } from 'react'
import Button from '@/components/UI/Button'
import useLoadVisuals from '@/hooks/useLoadVisuals'

const ROWS_PER_PAGE = 20

const VisHistoryTable = () => {
	const { visuals, status, error } = useLoadVisuals()
	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

	const start = (page - 1) * ROWS_PER_PAGE
	const end = start + ROWS_PER_PAGE
	const paginatedVisuals = visuals.slice(start, end)
	const totalPages = Math.ceil(visuals.length / ROWS_PER_PAGE)

	useEffect(() => {
		startTransition(() => {
			setPage(1)
		})
	}, [visuals.length])

	return (
		<div className='min-w-full'>
			<div className='mt-8 flow-root'>
				<div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
					<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
						<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
							<table className='relative min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
								<thead className='bg-gray-50 dark:bg-gray-800'>
									<tr>
										<th
											scope='col'
											className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'
										>
											Date
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
										>
											Cylinder
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
										>
											Passed
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
										>
											Oxygen Clean
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
										>
											Details
										</th>
									</tr>
								</thead>
								<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
									{paginatedVisuals.map((vis) => (
										<VisHistoryRow key={vis.id} visual={vis} />
									))}
								</tbody>
							</table>
							<div className='flex items-center justify-between px-4 py-4'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
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

export default VisHistoryTable

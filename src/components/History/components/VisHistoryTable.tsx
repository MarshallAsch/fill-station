import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import VisHistoryRow from './VisHistoryRow'
import { useQuery } from '@tanstack/react-query'
import { setVisHistory } from '@/redux/history/historySlice'
import { getAllVisuals } from '@/app/_api'

function useLoadVisuals() {
	const { status, data, error } = useQuery({
		queryKey: ['fills'],
		queryFn: getAllVisuals,
	})

	const dispatch = useAppDispatch()
	const { visHistory: visuals } = useAppSelector((state) => state.history)

	if (data) {
		dispatch(setVisHistory(data))
	}

	return { visuals, status, error }
}

const VisHistoryTable = () => {
	const { visuals, status, error } = useLoadVisuals()

	return (
		<div className='min-w-full'>
			<div className='mt-8 flow-root'>
				<div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
					<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
						<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
							<table className='relative min-w-full divide-y divide-gray-300'>
								<thead className='bg-gray-50'>
									<tr>
										<th
											scope='col'
											className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
										>
											Date
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
										>
											Cylinder
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
										>
											Passed
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
										>
											Oxygen Clean
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
										>
											Details
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200 bg-white'>
									{visuals.map((vis) => (
										<VisHistoryRow key={vis.id} visual={vis} />
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default VisHistoryTable

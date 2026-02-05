import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import HistoryRow from './HistoryRow'
import { useQuery } from '@tanstack/react-query'
import { getAllFills } from '@/app/_api'
import { setFillHistory } from '@/redux/history/historySlice'
import { Fill } from '@/types/fills'

function useLoadFills() {
	const { status, data, error } = useQuery({
		queryKey: ['fills'],
		queryFn: getAllFills,
	})

	const dispatch = useAppDispatch()
	const { fillHistory: fills } = useAppSelector((state) => state.history)

	if (data) {
		dispatch(setFillHistory(data))
	}

	return { fills, status, error }
}

const HistoryTable = () => {
	const { fills, status, error } = useLoadFills()

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
											Mix
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
										>
											Start Pressure
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
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
								<tbody className='divide-y divide-gray-200 bg-white'>
									{fills.map((fill) => (
										<HistoryRow key={fill.id} fill={fill} />
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

export default HistoryTable
function setFills(data: Fill[]): any {
	throw new Error('Function not implemented.')
}

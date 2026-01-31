import { useAppSelector } from '@/redux/hooks'
import VisHistoryRow from './VisHistoryRow'

const VisHistoryTable = () => {
	const cylinders = useAppSelector((state) => state.cylinders)
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
									{cylinders
										.filter((c) => c.lastVis)
										.map((cylinder) => (
											<VisHistoryRow
												key={cylinder.serialNumber}
												cylinder={cylinder}
											/>
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

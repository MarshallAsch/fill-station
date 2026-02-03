import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import FillsRow from './FillsRow'
import { addNewFill } from '@/redux/fills/fillsSlice'

const FillsTable = () => {
	const fills = useAppSelector((state) => state.fills)
	const dispatch = useAppDispatch()
	return (
		<div className='px-4 sm:px-6 lg:px-8'>
			<div className='flex justify-end'>
				<div className='m sm:mt-0 sm:ml-16 sm:flex-none'>
					<button
						onClick={() => dispatch(addNewFill())}
						type='button'
						className='block cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
					>
						Add Fill
					</button>
				</div>
				<div className='m sm:mt-0 sm:ml-5 sm:flex-none'>
					<button
						onClick={() => console.log(fills)}
						type='button'
						className='block cursor-pointer rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
					>
						Submit
					</button>
				</div>
			</div>
			<div className='mt-8 flow-root'>
				<div className='sm:-mx-6 lg:-mx-8'>
					<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
						<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
							<table className='relative min-w-full divide-y divide-gray-300'>
								<thead className='bg-gray-50'>
									<tr>
										<th
											scope='col'
											className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6'
										>
											Cylinder
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
										>
											Fill Type
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
										>
											Contents
										</th>
										<th
											scope='col'
											className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
										>
											Start Pressure
										</th>
										<th scope='col' className='py-3.5 pr-4 pl-3 sm:pr-6'>
											End Pressure
										</th>
										<th scope='col' className='py-3.5 pr-4 pl-3 sm:pr-6'></th>
									</tr>
								</thead>
								<tbody className='h-full divide-y divide-gray-200 bg-white'>
									{fills.map((fill) => (
										<FillsRow key={fill.id} fill={fill} />
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

export default FillsTable

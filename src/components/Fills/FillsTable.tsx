import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import FillsRow from './FillsRow'
import { addNewFill } from '@/redux/fills/fillsSlice'
import Button from '../UI/Button'
import { Client } from '@/types/client'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

const FillsTable = ({ client }: { client?: Client }) => {
	const fills = useAppSelector((state) => state.fills)
	const dispatch = useAppDispatch()

	return (
		<div className='px-4 sm:px-6 lg:px-8'>
			<div className='flex justify-end'>
				<div className='sm:mt-0 sm:ml-16 sm:flex-none'>
					<Button onClick={() => dispatch(addNewFill())} variant='ghost'>
						Add Fill
					</Button>
				</div>
				<div className='sm:mt-0 sm:ml-5 sm:flex-none'>
					<Button onClick={() => console.log(fills)}>Submit</Button>
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
										<FillsRow
											disableDelete={fills.length === 1}
											key={fill.id}
											fill={fill}
											client={client}
										/>
									))}
									<tr>
										<td
											colSpan={6}
											className='h-full bg-gray-50 py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
										>
											<div>
												<Button
													onClick={() => dispatch(addNewFill())}
													variant='ghost'
												>
													<PlusCircleIcon className='h-10 w-10' />
												</Button>
											</div>
										</td>
									</tr>
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

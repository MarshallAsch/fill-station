import CylinderListRow from './CylinderListRow'
import { Cylinder } from '@/types/cylinder'
import { Cylinder as CylinderModel } from '@/lib/models/cylinder'

const CylinderListTable = ({
	cylinders,
	showOwner = false,
}: {
	cylinders: Cylinder[] | CylinderModel[]
	showOwner?: boolean
}) => {
	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='relative min-w-full divide-y divide-gray-300'>
							<thead className='bg-gray-50'>
								<tr>
									<th
										scope='col'
										className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
									>
										Serial number
									</th>
									{showOwner && (
										<th
											scope='col'
											className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
										>
											Owner
										</th>
									)}
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
										Last Hydro
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Last Vis
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Next Hydro
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Next Vis
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
									>
										Do Inspection
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200 bg-white'>
								{cylinders.map((cylinder) => (
									<CylinderListRow
										key={cylinder.id}
										cylinder={cylinder}
										showOwner={showOwner}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CylinderListTable

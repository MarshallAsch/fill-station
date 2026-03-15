import { Cylinder } from '@/types/cylinder'
import CylinderListRow from './CylinderListRow'
import { Cylinder as CylinderDB } from '@/lib/models/cylinder'

type CylinderListProps = {
	cylinders: Cylinder[] | CylinderDB[]
	showOwner?: boolean
}

const CylinderListTable = ({
	cylinders,
	showOwner = false,
}: CylinderListProps) => {
	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg'>
						<table className='relative min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-800'>
								<tr>
									<th
										scope='col'
										className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'
									>
										Serial number
									</th>
									{showOwner && (
										<th
											scope='col'
											className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'
										>
											Owner
										</th>
									)}
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
										Last Hydro
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Last Vis
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Next Hydro
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Next Vis
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Do Inspection
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
								{cylinders.map((cylinder) => (
									<CylinderListRow
										key={cylinder.id}
										cylinder={JSON.parse(JSON.stringify(cylinder))}
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

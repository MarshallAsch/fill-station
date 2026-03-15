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
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Do Inspection
									</th>
									<th
										scope='col'
										className='text-text px-3 py-3.5 text-center text-sm font-semibold'
									>
										Edit
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
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

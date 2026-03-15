import { Cylinder } from '@/types/cylinder'

const CylindersList = ({ cylinders }: { cylinders: Cylinder[] }) => {
	if (cylinders.length === 0) {
		return (
			<p className='text-sm text-gray-500 dark:text-gray-400'>
				No cylinders found.
			</p>
		)
	}

	return (
		<div className='flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:outline-white/10'>
						<table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-800'>
								<tr>
									<th className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'>
										Serial Number
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										Material
									</th>
									<th className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'>
										Service Pressure
									</th>
								</tr>
							</thead>
							<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
								{cylinders.map((cyl) => (
									<tr
										key={cyl.id}
										className='hover:bg-gray-100 dark:hover:bg-gray-800'
									>
										<td className='py-4 pr-3 pl-4 text-center text-sm font-medium text-gray-900 sm:pl-6 dark:text-gray-100'>
											{cyl.serialNumber}
										</td>
										<td className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
											{cyl.material}
										</td>
										<td className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
											{cyl.servicePressure}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CylindersList

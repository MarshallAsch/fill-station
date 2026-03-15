import { Cylinder } from '@/types/cylinder'

const CylindersList = ({ cylinders }: { cylinders: Cylinder[] }) => {
	if (cylinders.length === 0) {
		return <p className='text-light-text text-sm'>No cylinders found.</p>
	}

	return (
		<div className='flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:outline-white/10'>
						<table className='divide-divider-strong min-w-full divide-y'>
							<thead className='bg-surface'>
								<tr>
									<th className='text-text py-3.5 pr-3 pl-4 text-center text-sm font-semibold sm:pl-6'>
										Serial Number
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Material
									</th>
									<th className='text-text px-3 py-3.5 text-center text-sm font-semibold'>
										Service Pressure
									</th>
								</tr>
							</thead>
							<tbody className='bg-background divide-divider divide-y'>
								{cylinders.map((cyl) => (
									<tr key={cyl.id} className='hover:bg-hover'>
										<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium sm:pl-6'>
											{cyl.serialNumber}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
											{cyl.material}
										</td>
										<td className='text-light-text px-3 py-4 text-center text-sm'>
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

import { Cylinder } from '@/types/cylinder'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import Tooltip from '../UI/Tooltip'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Cylinder as CylinderModel } from '@/lib/models/cylinder'

dayjs.extend(relativeTime)

const CylinderListRow = ({
	cylinder,
}: {
	cylinder: Cylinder | CylinderModel
}) => {
	let nextHydro = cylinder.lastHydro.add(5, 'year')
	let nextVis = cylinder.lastVis.add(1, 'year')

	return (
		<tr key={cylinder.id} className='hover:bg-gray-100'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{cylinder.serialNumber}
			</td>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				<span className='flex w-full justify-center'>
					{cylinder.oxygenClean ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{cylinder.lastHydro.format('MM/YYYY')}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{cylinder.lastVis.format('MM/YYYY')}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				<Tooltip message={nextHydro.format('MM/YYYY')}>
					{nextHydro.isBefore(dayjs()) ? 'now' : nextHydro.fromNow()}
				</Tooltip>
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				<Tooltip message={nextVis.format('MM/YYYY')}>
					{nextVis.isBefore(dayjs()) ? 'now' : nextVis.fromNow()}
				</Tooltip>
			</td>
		</tr>
	)
}

export default CylinderListRow

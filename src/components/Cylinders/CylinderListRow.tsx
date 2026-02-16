import { Cylinder } from '@/types/cylinder'
import {
	CheckCircleIcon,
	XCircleIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import Tooltip from '../UI/Tooltip'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Cylinder as CylinderModel } from '@/lib/models/cylinder'
import Link from 'next/link'

dayjs.extend(relativeTime)

const CylinderListRow = ({
	cylinder,
	showOwner = false,
}: {
	cylinder: Cylinder | CylinderModel
	showOwner?: boolean
}) => {
	let nextHydro = cylinder.lastHydro.add(5, 'year')
	let nextVis = cylinder.lastVis.add(1, 'year')

	return (
		<tr key={cylinder.id} className='hover:bg-gray-100'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{cylinder.serialNumber}
			</td>
			{showOwner && (
				<th
					scope='col'
					className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6'
				>
					<Link
						href={`/clients/${cylinder.ownerId}`}
						className='flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10'
					>
						{cylinder.ownerId}
						<InformationCircleIcon />
					</Link>
				</th>
			)}
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

			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{nextHydro.isBefore(dayjs()) ? (
					'Needs Hydro First'
				) : (
					<Link
						href={`/visual?client=${cylinder.ownerId}&cylinder=${cylinder.id}`}
						className='flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10'
					>
						Inspect now
					</Link>
				)}
			</td>
		</tr>
	)
}

export default CylinderListRow

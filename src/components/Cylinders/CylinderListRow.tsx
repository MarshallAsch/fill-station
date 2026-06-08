'use client'
import { Cylinder } from '@/types/cylinder'
import {
	CheckCircleIcon,
	XCircleIcon,
	InformationCircleIcon,
	Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import dayjs from 'dayjs'
import Tooltip from '../UI/Tooltip'
import relativeTime from 'dayjs/plugin/relativeTime'

import Link from 'next/link'
import Button from '../UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import { updateEditCylinderModal } from '@/redux/modal/modalSlice'

dayjs.extend(relativeTime)

const CylinderListRow = ({
	cylinder,
	showOwner = false,
	hideInspection = false,
	disableEdit = false,
}: {
	cylinder: Cylinder
	showOwner?: boolean
	hideInspection?: boolean
	disableEdit?: boolean
}) => {
	const dispatch = useAppDispatch()

	const nextHydro = dayjs(cylinder.lastHydro).add(5, 'year')
	const nextVis = dayjs(cylinder.lastVis).add(1, 'year')

	return (
		<tr key={cylinder.id} className='hover:bg-hover'>
			<td className='px-2 py-4 text-center whitespace-nowrap'>
				{!cylinder.verified && (
					<Tooltip message='User entered details, requires verification'>
						<ExclamationTriangleIcon className='h-5 w-5 fill-yellow-500' />
					</Tooltip>
				)}
			</td>
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{cylinder.nickname ? (
					<div className='flex flex-col items-center'>
						<span>{cylinder.nickname}</span>
						<span className='text-light-text text-xs'>
							{cylinder.serialNumber}
						</span>
					</div>
				) : (
					cylinder.serialNumber
				)}
				{cylinder.pairedCylinder && (
					<div className='text-light-text mt-1 text-xs'>
						🔗{' '}
						{cylinder.pairedCylinder.nickname ??
							cylinder.pairedCylinder.serialNumber}
					</div>
				)}
			</td>
			{showOwner && (
				<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
					{cylinder.ownerId ? (
						<Link
							href={`/clients/${cylinder.ownerId}`}
							className='hover:text-accent inline-flex items-center gap-1 underline-offset-2 hover:underline'
						>
							<span>{cylinder.Client?.name ?? `#${cylinder.ownerId}`}</span>
							<InformationCircleIcon className='h-4 w-4' />
						</Link>
					) : (
						<span className='text-light-text'>—</span>
					)}
				</td>
			)}
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				<span className='flex w-full justify-center'>
					{cylinder.oxygenClean ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{dayjs(cylinder.lastHydro).format('MM/YYYY')}
			</td>
			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{dayjs(cylinder.lastVis).format('MM/YYYY')}
			</td>
			<td className='text-light-text hidden px-3 py-4 text-center text-sm whitespace-nowrap md:table-cell'>
				<Tooltip message={nextHydro.format('MM/YYYY')}>
					{nextHydro.isBefore(dayjs()) ? 'now' : nextHydro.fromNow()}
				</Tooltip>
			</td>
			<td className='text-light-text hidden px-3 py-4 text-center text-sm whitespace-nowrap md:table-cell'>
				<Tooltip message={nextVis.format('MM/YYYY')}>
					{nextVis.isBefore(dayjs()) ? 'now' : nextVis.fromNow()}
				</Tooltip>
			</td>

			{!hideInspection && (
				<td className='text-light-text hidden px-3 py-4 text-center text-sm whitespace-nowrap md:table-cell'>
					{nextHydro.isBefore(dayjs()) ? (
						'Needs Hydro First'
					) : (
						<Link
							href={`/visual?client=${cylinder.ownerId}&cylinder=${cylinder.id}`}
							className='bg-card-hover hover:bg-hover flex cursor-pointer flex-col items-center justify-between gap-2 p-6 transition sm:p-10'
						>
							Inspect now
						</Link>
					)}
				</td>
			)}
			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{disableEdit ? (
					<Tooltip message='Please contact the shop to update the details'>
						<Button disabled>
							<Cog6ToothIcon className='h-5' />
						</Button>
					</Tooltip>
				) : (
					<Button
						onClick={() =>
							dispatch(updateEditCylinderModal(cylinder as Cylinder))
						}
					>
						<Cog6ToothIcon className='h-5' />
					</Button>
				)}
			</td>
		</tr>
	)
}

export default CylinderListRow

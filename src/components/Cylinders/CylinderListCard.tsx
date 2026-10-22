'use client'
import { Cylinder } from '@/types/cylinder'
import { Cog6ToothIcon, LinkIcon } from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { parseMonthStamp } from '@/lib/monthStamp'
import { useAppDispatch } from '@/redux/hooks'
import { updateEditCylinderModal } from '@/redux/modal/modalSlice'

// Mobile stand-in for CylinderListRow: the table needs ~540px, so below md
// each cylinder renders as a card. Due dates are shown inline because the
// table's hover tooltips never appear on touch.
const CylinderListCard = ({
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

	const lastHydro = parseMonthStamp(cylinder.lastHydro)
	const lastVis = parseMonthStamp(cylinder.lastVis)
	const nextHydro = lastHydro.add(5, 'year')
	const nextVis = lastVis.add(1, 'year')
	const hydroDue = nextHydro.isBefore(dayjs())
	const visDue = nextVis.isBefore(dayjs())

	return (
		<li className='bg-background flex gap-3 py-3 pr-2 pl-4'>
			<div className='flex min-w-0 flex-1 flex-col gap-2'>
				<div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
					<span className='text-text text-base font-semibold'>
						{cylinder.nickname ?? cylinder.serialNumber}
					</span>
					{cylinder.nickname && (
						<span className='text-light-text text-sm'>
							{cylinder.serialNumber}
						</span>
					)}
					{cylinder.oxygenClean && (
						<span className='bg-surface text-accent-text rounded-full px-2 py-0.5 text-xs font-semibold'>
							O₂ clean
						</span>
					)}
				</div>
				{cylinder.pairedCylinder && (
					<div className='text-light-text flex items-center gap-1 text-xs'>
						<LinkIcon className='h-3 w-3' />
						<span>
							{cylinder.pairedCylinder.nickname ??
								cylinder.pairedCylinder.serialNumber}
						</span>
					</div>
				)}
				{showOwner && cylinder.ownerId && (
					<Link
						href={`/clients/${cylinder.ownerId}`}
						className='text-accent-text text-sm underline-offset-2 hover:underline'
					>
						{cylinder.Client?.name ?? `#${cylinder.ownerId}`}
					</Link>
				)}
				<dl className='grid grid-cols-2 gap-x-3 gap-y-1 text-sm'>
					<div>
						<dt className='text-light-text'>Hydro</dt>
						<dd
							className={clsx(
								hydroDue ? 'text-danger font-semibold' : 'text-text',
							)}
						>
							{lastHydro.format('MM/YYYY')} · due {nextHydro.format('MM/YYYY')}
						</dd>
					</div>
					<div>
						<dt className='text-light-text'>Visual</dt>
						<dd
							className={clsx(
								visDue ? 'text-danger font-semibold' : 'text-text',
							)}
						>
							{lastVis.format('MM/YYYY')} · due {nextVis.format('MM/YYYY')}
						</dd>
					</div>
				</dl>
				{!cylinder.verified && (
					<p className='text-warning flex items-center gap-1 text-xs'>
						<ExclamationTriangleIcon className='h-4 w-4 shrink-0' />
						User entered details, requires verification
					</p>
				)}
				{!hideInspection &&
					(hydroDue ? (
						<p className='text-light-text text-sm'>Needs Hydro First</p>
					) : (
						<Link
							href={`/visual?client=${cylinder.ownerId}&cylinder=${cylinder.id}`}
							className='text-accent-text text-sm font-semibold'
						>
							Inspect now
						</Link>
					))}
				{disableEdit && (
					<p className='text-light-text text-xs'>
						Please contact the shop to update the details
					</p>
				)}
			</div>
			{!disableEdit && (
				<button
					type='button'
					onClick={() =>
						dispatch(updateEditCylinderModal(cylinder as Cylinder))
					}
					className='text-light-text hover:bg-hover flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md'
				>
					<span className='sr-only'>Edit cylinder</span>
					<Cog6ToothIcon className='size-5' />
				</button>
			)}
		</li>
	)
}

export default CylinderListCard

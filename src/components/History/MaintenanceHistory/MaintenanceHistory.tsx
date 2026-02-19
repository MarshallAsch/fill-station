import dayjs from 'dayjs'
import clsx from 'clsx'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAppDispatch } from '@/redux/hooks'
import {
	updateAddServiceModalOpen,
	updateServiceModalHours,
} from '@/redux/modal/modalSlice'
import {
	BeakerIcon,
	Cog6ToothIcon,
	ExclamationCircleIcon,
	EyeDropperIcon,
	PlayIcon,
	WrenchIcon,
} from '@heroicons/react/20/solid'
import { MAINTENANCE_TYPE } from '@/types/maintenance'
import Button from '@/components/UI/Button'
import { getAllMaintenance, getMaintenanceSummary } from '@/app/_api'
import { useQuery } from '@tanstack/react-query'
import Tooltip from '@/components/UI/Tooltip'
dayjs.extend(relativeTime)

function useLoadMaintenance() {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance'],
		queryFn: getAllMaintenance,
	})

	return { maintenance: data, status, error }
}

function useLoadMaintenanceSummary() {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance', 'summary'],
		queryFn: getMaintenanceSummary,
	})

	const dispatch = useAppDispatch()
	if (data?.last) {
		dispatch(updateServiceModalHours(data?.last.hours))
	}

	return { summary: data, status, error }
}

const MaintenanceHistory = () => {
	const { maintenance } = useLoadMaintenance()
	const { summary } = useLoadMaintenanceSummary()

	const dispatch = useAppDispatch()
	const getColor = (type: MAINTENANCE_TYPE) => {
		switch (type) {
			case 'start':
				return 'bg-green-500'
			case 'air-test':
				return 'bg-blue-500'
			case 'oil-change':
			case 'general':
				return 'bg-red-500'
			case 'filter-change':
				return 'bg-gray-400'
			default:
				return 'error'
		}
	}

	const getIcon = (type: MAINTENANCE_TYPE) => {
		switch (type) {
			case 'start':
				return <PlayIcon aria-hidden='true' className='size-5 text-white' />
			case 'air-test':
				return <BeakerIcon aria-hidden='true' className='size-5 text-white' />
			case 'oil-change':
				return (
					<EyeDropperIcon aria-hidden='true' className='size-5 text-white' />
				)
			case 'general':
				return <WrenchIcon aria-hidden='true' className='size-5 text-white' />
			case 'filter-change':
				return (
					<Cog6ToothIcon aria-hidden='true' className='size-5 text-white' />
				)
			default:
				return (
					<ExclamationCircleIcon
						aria-hidden='true'
						className='size-5 text-white'
					/>
				)
		}
	}

	const getTitle = (type: MAINTENANCE_TYPE) => {
		switch (type) {
			case 'start':
				return 'Got the compressor'
			case 'air-test':
				return 'Air analysis done'
			case 'oil-change':
				return 'Changed Oil'
			case 'general':
				return 'General Service'
			case 'filter-change':
				return 'Changed Filter'
			default:
				return 'Unkown'
		}
	}

	const getSummaryTitle = (type: MAINTENANCE_TYPE) => {
		switch (type) {
			case 'start':
				return 'First Used'
			case 'air-test':
				return 'Last Air Analysis'
			case 'oil-change':
				return 'Last Oil Change'
			case 'general':
				return 'Last General Service'
			case 'filter-change':
				return 'Last Filter Change'
			default:
				return 'Unknown'
		}
	}

	return (
		<div className='flow-root w-full'>
			<h1 className='text-center text-4xl font-bold'>
				Compressor Maintenance Timeline
			</h1>
			<div className='my-8 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center md:grid-cols-2 lg:grid-cols-4'>
				{summary &&
					Object.entries(summary)
						.filter(([key, value]) => key !== 'last' && value !== null)
						.map(([key, item]) => (
							<div
								key={key}
								className='flex flex-col items-center bg-gray-400/5 p-8'
							>
								<dt className='text-3xl font-semibold text-black'>
									<Tooltip message={item.date.format('DD/MM/YYYY')}>
										{item.date.from(dayjs(), true)} ago
									</Tooltip>
								</dt>
								<dd className='order-first text-xl font-semibold tracking-tight text-gray-500'>
									{getSummaryTitle(item.type)}
								</dd>
							</div>
						))}
			</div>
			<div className='my-2 flex w-full items-center justify-end'>
				<div>
					<Button
						onClick={() => {
							dispatch(updateAddServiceModalOpen(true))
						}}
					>
						Record Service
					</Button>
				</div>
			</div>
			<ul role='list' className='-mb-8'>
				{maintenance
					?.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
					.map((event, eventIdx) => (
						<li key={event.id}>
							<div className='relative pb-8 hover:font-bold'>
								{eventIdx !== maintenance.length - 1 ? (
									<span
										aria-hidden='true'
										className='absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200'
									/>
								) : null}
								<div className='relative flex items-center space-x-3'>
									<div>
										<span
											className={clsx(
												getColor(event.type),
												'flex size-8 items-center justify-center rounded-full ring-8 ring-white',
											)}
										>
											{getIcon(event.type)}
										</span>
									</div>
									<div className='flex min-w-0 flex-1 justify-between space-x-4 pt-1.5'>
										<div>
											<p className='font-medium text-gray-900'>
												{getTitle(event.type)}
											</p>
											<p className='text-sm text-gray-500'>
												{event.description}
											</p>
										</div>
										<div className='text-right text-sm whitespace-nowrap text-gray-500'>
											<time dateTime={event.date.format('DD/MM/YYYY')}>
												{event.date.format('DD/MM/YYYY')}
											</time>
											<p className='text-sm text-gray-500'>
												{event.hours} hours
											</p>
										</div>
									</div>
								</div>
							</div>
						</li>
					))}
			</ul>
		</div>
	)
}

export default MaintenanceHistory

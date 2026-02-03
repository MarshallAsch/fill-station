import dayjs from 'dayjs'
import clsx from 'clsx'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { MAINTENANCE_TYPE } from '@/redux/history/historySlice'
import { useMemo } from 'react'
import { updateAddServiceModalOpen } from '@/redux/modal/modalSlice'
import {
	BeakerIcon,
	Cog6ToothIcon,
	ExclamationCircleIcon,
	EyeDropperIcon,
	PlayIcon,
	WrenchIcon,
} from '@heroicons/react/20/solid'
dayjs.extend(relativeTime)

const MaintenanceHistory = () => {
	const { maintenanceTimeline } = useAppSelector((state) => state.history)
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

	const timeline = [...maintenanceTimeline].sort((a, b) =>
		dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : 0,
	)

	const getLastOilChange = useMemo(() => {
		return maintenanceTimeline
			.filter((item) => item.type === MAINTENANCE_TYPE.OIL_CHANGE)
			.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : 0))[0]
	}, [maintenanceTimeline])

	const getLastFilterChange = useMemo(() => {
		return maintenanceTimeline
			.filter((item) => item.type === MAINTENANCE_TYPE.FILTER_CHANGE)
			.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : 0))[0]
	}, [maintenanceTimeline])

	const getLastAirAnalysis = useMemo(() => {
		return maintenanceTimeline
			.filter((item) => item.type === MAINTENANCE_TYPE.AIR_TEST)
			.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : 0))[0]
	}, [maintenanceTimeline])

	const getCompressorAge = dayjs(
		maintenanceTimeline.filter(
			(item) => item.type === MAINTENANCE_TYPE.START,
		)[0].date,
	).from(dayjs(), true)

	const lastMaintenance = [
		getLastOilChange,
		getLastFilterChange,
		getLastAirAnalysis,
	]

	return (
		<div className='flow-root w-full'>
			<h1 className='text-center text-4xl font-bold'>
				Compressor Maintenance Timeline
			</h1>
			<div className='my-8 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center md:grid-cols-2 lg:grid-cols-4'>
				{lastMaintenance.map((item) => (
					<div key={item.id} className='flex flex-col bg-gray-400/5 p-8'>
						<dt className='text-3xl font-semibold text-black'>
							{dayjs(item.date).format('DD/MM/YYYY')}
						</dt>
						<dd className='order-first text-xl font-semibold tracking-tight text-gray-500'>
							Last {item.title}
						</dd>
					</div>
				))}
				<div className='flex flex-col bg-gray-400/5 p-8'>
					<dt className='text-3xl font-semibold text-black'>
						{getCompressorAge} old
					</dt>
					<dd className='order-first text-xl font-semibold tracking-tight text-gray-500'>
						Compressor Age
					</dd>
				</div>
			</div>
			<div className='my-2 flex w-full items-center justify-end'>
				<button
					onClick={() => {
						dispatch(updateAddServiceModalOpen(true))
					}}
					type='button'
					className='block cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
				>
					Record Service
				</button>
			</div>
			<ul role='list' className='-mb-8'>
				{timeline.map((event, eventIdx) => (
					<li key={event.id}>
						<div className='relative pb-8 hover:font-bold'>
							{eventIdx !== timeline.length - 1 ? (
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
										<p className='font-medium text-gray-900'>{event.title}</p>
										<p className='text-sm text-gray-500'>{event.content}</p>
									</div>
									<div className='text-right text-sm whitespace-nowrap text-gray-500'>
										<time dateTime={dayjs(event.date).format('DD/MM/YYYY')}>
											{dayjs(event.date).format('DD/MM/YYYY')}
										</time>
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

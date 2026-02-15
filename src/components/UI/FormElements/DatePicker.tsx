import { useState, useMemo, useRef, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

type DatePickerProps = {
	mode?: 'date' | 'month'
	title: string
	name: string
	id: string
	description?: string
	value?: Dayjs
	readOnly?: boolean
	defaultValue?: Dayjs
	onChange?: (date: Dayjs) => void
}

export default function DatePicker({
	mode = 'date',
	title,
	name,
	id,
	description,
	readOnly = false,
	defaultValue,
	value,
	onChange,
}: DatePickerProps) {
	const today = dayjs()
	const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultValue || today)
	const [currentMonth, setCurrentMonth] = useState(selectedDate)
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const startOfMonth = currentMonth.startOf('month')
	const endOfMonth = currentMonth.endOf('month')
	const startDay = startOfMonth.day()

	const days = useMemo(() => {
		if (mode !== 'date') return []
		const result = []
		for (let i = 0; i < startDay; i++) result.push(null)
		for (let d = 1; d <= endOfMonth.date(); d++) {
			result.push(startOfMonth.date(d))
		}
		return result
	}, [endOfMonth, mode, startDay, startOfMonth])

	const months = Array.from({ length: 12 }, (_, i) => dayjs().month(i))

	const isSelected = (date: Dayjs) =>
		selectedDate.isSame(date, mode === 'month' ? 'month' : 'day')

	const selectDate = (date: Dayjs) => {
		setSelectedDate(date)
		onChange && onChange(date)
		setOpen(false)
	}

	const isDisabled = (date: Dayjs | null): boolean => {
		if (mode === 'month') {
			return date?.endOf('month').isAfter(today, 'day') || false
		}
		return date?.isAfter(today, 'day') || false
	}

	return (
		<div ref={ref} className='flex w-full flex-col gap-2'>
			<label>{title}</label>
			<button
				type='button'
				onClick={() => !readOnly && setOpen((o) => !o)}
				className='flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm hover:border-gray-400'
			>
				{mode === 'month'
					? (value || selectedDate).format('MMMM YYYY')
					: (value || selectedDate).format('MMM DD YYYY')}
				<span className=''>
					<CalendarDaysIcon className='h-5 w-5' />
				</span>
			</button>
			{description && (
				<p className='-mt-2 text-xs text-gray-500'>{description}</p>
			)}

			{open && (
				<div className='absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg'>
					{/* Header */}
					<div className='mb-4 flex items-center justify-between'>
						<button
							type='button'
							onClick={() => setCurrentMonth((m) => m.subtract(1, 'year'))}
							className='rounded-md px-2 py-1 text-sm hover:bg-gray-100'
						>
							<ChevronLeftIcon className='h-2 w-2' />
						</button>
						<div className='font-semibold'>{currentMonth.format('YYYY')}</div>
						<button
							type='button'
							onClick={() => setCurrentMonth((m) => m.add(1, 'year'))}
							className='rounded-md px-2 py-1 text-sm hover:bg-gray-100'
						>
							<ChevronRightIcon className='h-2 w-2' />
						</button>
					</div>

					{mode === 'date' && (
						<div className='mb-4 flex items-center justify-between'>
							<button
								type='button'
								onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
								className='rounded-md px-2 py-1 text-sm hover:bg-gray-100'
							>
								<ChevronLeftIcon className='h-2 w-2' />
							</button>
							<div className='font-medium'>{currentMonth.format('MMMM')}</div>
							<button
								type='button'
								onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
								className='rounded-md px-2 py-1 text-sm hover:bg-gray-100'
							>
								<ChevronRightIcon className='h-2 w-2' />
							</button>
						</div>
					)}

					{mode === 'month' && (
						<div className='grid grid-cols-3 gap-2'>
							{months.map((m, idx) => {
								const date = currentMonth.month(idx)
								return (
									<button
										key={m.toISOString()}
										type='button'
										onClick={() => selectDate(date)}
										className={`\ rounded-lg px-2 py-2 text-sm transition ${
											isSelected(date)
												? 'bg-blue-600 text-white'
												: 'hover:bg-gray-100'
										}`}
									>
										{date.format('MMM')}
									</button>
								)
							})}
						</div>
					)}

					{mode === 'date' && (
						<>
							{/* Weekdays */}
							<div className='mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-500'>
								{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
									<div key={d}>{d}</div>
								))}
							</div>

							{/* Days */}
							<div className='grid grid-cols-7 gap-1 text-center'>
								{days.map((date, idx) => (
									<button
										key={idx}
										type='button'
										onClick={() => date && selectDate(date)}
										disabled={isDisabled(date)}
										className={
											!date
												? 'h-9'
												: `\ h-9 rounded-lg text-sm transition ${
														isSelected(date)
															? 'bg-blue-600 text-white'
															: 'hover:bg-gray-100'
													} \ ${
														date.isSame(today, 'day') && !isSelected(date)
															? 'border border-blue-500'
															: ''
													}${
														isDisabled(date) && 'cursor-not-allowed opacity-40'
													}`
										}
									>
										{date?.date()}
									</button>
								))}
							</div>
						</>
					)}
				</div>
			)}

			{/* This allows the input to be collected when the form is submitted */}
			<input
				id={id}
				type='hidden'
				name={name}
				value={(value || selectedDate)
					.hour(0)
					.minute(0)
					.second(0)
					.millisecond(0)
					.toISOString()}
			/>
		</div>
	)
}

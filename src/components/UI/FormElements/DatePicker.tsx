import { useState, useMemo, useRef, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { toMonthStamp } from '@/lib/monthStamp'

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
	// In month mode every date is a month stamp anchored at UTC midnight on the
	// first, so the month reads the same in every timezone.
	const anchor = (date: Dayjs) => (mode === 'month' ? toMonthStamp(date) : date)
	const thisMonth = anchor(today)
	const shownValue = value && anchor(value)
	const [selectedDate, setSelectedDate] = useState<Dayjs>(
		anchor(defaultValue || today),
	)
	const [currentMonth, setCurrentMonth] = useState(shownValue || selectedDate)
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement | null>(null)

	const toggleOpen = () => {
		if (readOnly) return
		if (!open) setCurrentMonth(shownValue || selectedDate)
		setOpen(!open)
	}

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const days = useMemo(() => {
		if (mode !== 'date') return []
		const startOfMonth = currentMonth.startOf('month')
		const result = []
		for (let i = 0; i < startOfMonth.day(); i++) result.push(null)
		for (let d = 1; d <= currentMonth.endOf('month').date(); d++) {
			result.push(startOfMonth.date(d))
		}
		return result
	}, [currentMonth, mode])

	const isSelected = (date: Dayjs) =>
		selectedDate.isSame(date, mode === 'month' ? 'month' : 'day')

	const selectDate = (date: Dayjs) => {
		setSelectedDate(date)
		onChange && onChange(date)
		setOpen(false)
	}

	const isDisabled = (date: Dayjs | null): boolean => {
		if (mode === 'month') {
			return date?.isAfter(thisMonth) || false
		}
		return date?.isAfter(today, 'day') || false
	}

	return (
		<div ref={ref} className='relative flex w-full flex-col gap-2'>
			<label>{title}</label>
			<button
				type='button'
				onClick={toggleOpen}
				className='bg-background border-border hover:border-border flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm shadow-sm'
			>
				{mode === 'month'
					? (shownValue || selectedDate).format('MMMM YYYY')
					: (shownValue || selectedDate).format('MMM DD YYYY')}
				<span className=''>
					<CalendarDaysIcon className='h-5 w-5' />
				</span>
			</button>
			{description && (
				<p className='text-light-text -mt-2 text-xs'>{description}</p>
			)}

			{open && (
				<div className='border-border bg-background text-text absolute top-full z-50 mt-2 w-72 max-w-full rounded-xl border p-4 shadow-lg'>
					{/* Header */}
					<div className='mb-4 flex items-center justify-between'>
						<button
							type='button'
							onClick={() => setCurrentMonth((m) => m.subtract(1, 'year'))}
							className='hover:bg-hover flex size-10 items-center justify-center rounded-md'
						>
							<ChevronLeftIcon className='size-4' />
						</button>
						<div className='font-semibold'>{currentMonth.format('YYYY')}</div>
						<button
							type='button'
							onClick={() => setCurrentMonth((m) => m.add(1, 'year'))}
							className='hover:bg-hover flex size-10 items-center justify-center rounded-md'
						>
							<ChevronRightIcon className='size-4' />
						</button>
					</div>

					{mode === 'date' && (
						<div className='mb-4 flex items-center justify-between'>
							<button
								type='button'
								onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
								className='hover:bg-hover flex size-10 items-center justify-center rounded-md'
							>
								<ChevronLeftIcon className='size-4' />
							</button>
							<div className='font-medium'>{currentMonth.format('MMMM')}</div>
							<button
								type='button'
								onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
								className='hover:bg-hover flex size-10 items-center justify-center rounded-md'
							>
								<ChevronRightIcon className='size-4' />
							</button>
						</div>
					)}

					{mode === 'month' && (
						<div className='grid grid-cols-3 gap-2'>
							{Array.from({ length: 12 }, (_, idx) => {
								const date = currentMonth.date(1).month(idx)
								return (
									<button
										key={date.format('YYYY-MM')}
										type='button'
										onClick={() => selectDate(date)}
										disabled={isDisabled(date)}
										className={`\ rounded-lg px-2 py-2 text-sm transition ${
											isSelected(date)
												? 'bg-accent text-white-text'
												: 'hover:bg-hover'
										} ${
											isDisabled(date) ? 'cursor-not-allowed opacity-40' : ''
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
							<div className='text-light-text mb-2 grid grid-cols-7 text-center text-xs font-medium'>
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
															? 'bg-accent text-white-text'
															: 'hover:bg-hover'
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
				value={(shownValue || selectedDate)
					.hour(0)
					.minute(0)
					.second(0)
					.millisecond(0)
					.toISOString()}
			/>
		</div>
	)
}

'use client'

import { ReactNode, useState } from 'react'
import clsx from 'clsx'
import {
	AdjustmentsHorizontalIcon,
	ChevronDownIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import Button from './Button'

export type FilterChip = {
	label: string
	onClear: () => void
}

type TableToolbarProps = {
	filters: ReactNode
	sort?: ReactNode
	chips?: FilterChip[]
	onClearAll?: () => void
}

const TableToolbar = ({
	filters,
	sort,
	chips = [],
	onClearAll,
}: TableToolbarProps) => {
	const hasChips = chips.length > 0
	// Below sm the filters stack full width, so they start collapsed behind a
	// toggle instead of pushing the table off the first screen.
	const [open, setOpen] = useState(false)
	return (
		<div className='border-border bg-surface mb-4 rounded-lg border p-3'>
			<button
				type='button'
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				className='text-text hover:bg-hover flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-sm font-semibold sm:hidden'
			>
				<span className='flex items-center gap-2'>
					<AdjustmentsHorizontalIcon className='size-5' aria-hidden='true' />
					Filters &amp; sort
					{hasChips && (
						<span className='bg-accent text-white-text rounded-full px-2 text-xs'>
							{chips.length}
						</span>
					)}
				</span>
				<ChevronDownIcon
					className={clsx('size-5 transition-transform', open && 'rotate-180')}
					aria-hidden='true'
				/>
			</button>
			<div
				className={clsx(
					'flex-wrap items-end gap-3 sm:flex',
					open ? 'mt-3 flex sm:mt-0' : 'hidden',
				)}
			>
				<div className='flex flex-1 flex-wrap items-end gap-3'>{filters}</div>
				{sort && <div className='w-full sm:w-auto'>{sort}</div>}
			</div>
			{hasChips && (
				<div className='mt-3 flex flex-wrap items-center gap-2'>
					{chips.map((chip) => (
						<button
							key={chip.label}
							type='button'
							onClick={chip.onClear}
							className='bg-card-hover text-text hover:bg-hover inline-flex min-h-9 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium sm:min-h-0'
						>
							<span>{chip.label}</span>
							<XMarkIcon className='h-3.5 w-3.5' aria-hidden='true' />
						</button>
					))}
					{onClearAll && (
						<Button variant='ghost' onClick={onClearAll}>
							Clear all
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

export default TableToolbar

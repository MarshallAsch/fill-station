'use client'

import { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
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
	return (
		<div className='border-border bg-surface mb-4 rounded-lg border p-3'>
			<div className='flex flex-wrap items-end gap-3'>
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
							className='bg-card-hover text-text hover:bg-hover inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'
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

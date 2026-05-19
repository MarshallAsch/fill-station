'use client'

import Button from './Button'

type PaginationProps = {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
	if (totalPages <= 1) return null

	return (
		<div className='flex items-center justify-between px-4 py-4'>
			<p className='text-light-text text-sm'>
				Page {page} of {totalPages}
			</p>
			<div className='flex gap-2'>
				<Button
					variant='ghost'
					onClick={() => onPageChange(Math.max(page - 1, 1))}
					disabled={page === 1}
				>
					Previous
				</Button>
				<Button
					variant='ghost'
					onClick={() => onPageChange(Math.min(page + 1, totalPages))}
					disabled={page >= totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	)
}

export default Pagination

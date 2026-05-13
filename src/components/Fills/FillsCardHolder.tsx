import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Client } from '@/types/client'
import { useEffect, useState, useTransition } from 'react'
import { addNewFill } from '@/redux/fills/fillsSlice'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import FillCard from './FillCard'

const ROWS_PER_PAGE = 20

type FillsCardHolderProps = {
	client: Client | null
}

const FillsCardHolder = ({ client }: FillsCardHolderProps) => {
	const fills = useAppSelector((state) => state.fills.fills)

	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

	const dispatch = useAppDispatch()

	const start = (page - 1) * ROWS_PER_PAGE
	const end = start + ROWS_PER_PAGE
	const paginatedFills = fills.slice(start, end)
	const totalPages = Math.ceil(fills.length / ROWS_PER_PAGE)

	useEffect(() => {
		startTransition(() => {
			setPage(1)
		})
	}, [fills.length])

	const [currentIndex, setCurrentIndex] = useState(0)

	const prevFill = () => {
		const isFirstSlide = currentIndex === 0
		const newIndex = isFirstSlide ? paginatedFills.length - 1 : currentIndex - 1
		setCurrentIndex(newIndex)
	}

	const nextFill = () => {
		const isLastSlide = currentIndex === paginatedFills.length - 1
		const newIndex = isLastSlide ? 0 : currentIndex + 1
		setCurrentIndex(newIndex)
	}

	useEffect(() => {
		if (currentIndex >= paginatedFills.length && paginatedFills.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCurrentIndex(paginatedFills.length - 1)
		}
	}, [paginatedFills.length, currentIndex])

	return (
		<div className='group relative flex max-w-screen flex-col gap-2 px-4 py-16'>
			{/* Slide Container */}
			<div className='h-full overflow-hidden rounded-2xl'>
				<div
					className='flex h-full transition-transform duration-500 ease-out'
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{paginatedFills.map((fill, index) => (
						<FillCard
							disableDelete={fills.length === 1}
							key={fill.id}
							fill={fill}
							client={client}
							index={index + 1}
						/>
					))}
				</div>
			</div>

			<div className='flex flex-row justify-between'>
				<div className='w-1/3'>
					<Button onClick={prevFill} disabled={currentIndex === 0}>
						Previous
					</Button>
				</div>

				<div className='w-1/3'>
					{currentIndex === paginatedFills.length - 1 ? (
						<Button onClick={() => dispatch(addNewFill())} variant='ghost'>
							<PlusCircleIcon className='h-5 w-5' />
						</Button>
					) : (
						<Button onClick={nextFill}>Next</Button>
					)}
				</div>
			</div>
		</div>
	)
}

export default FillsCardHolder

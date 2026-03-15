'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { EyeIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toast } from 'react-toastify'
import AirTank from '@/icons/AirTank'
import Services from '@/components/Home/Services'

function Home() {
	const searchParams = useSearchParams()

	useEffect(() => {
		if (searchParams.get('redirected') === 'true') {
			toast.warning(
				'You need to be logged in to access that page. Please sign in first.',
				{
					position: 'bottom-left',
					autoClose: 5000,
				},
			)
		}
	}, [searchParams])
	return (
		<div className='text-center'>
			<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-gray-100'>
				Dive Tec Fill Station Tracking
			</h1>
			<p className='mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl dark:text-gray-400'>
				A simple site for keeping track of service that was done at the fill
				station
			</p>
			<div className='mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8'>
				<div className='-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3'>
					<Link
						href='fills'
						className='dark:bg-background flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10 dark:hover:bg-gray-600/20'
					>
						<AirTank />
						<p>Fills</p>
					</Link>
					<Link
						href='visual'
						className='dark:bg-background flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10 dark:hover:bg-gray-600/20'
					>
						<EyeIcon />
						<p>Visual</p>
					</Link>
					<Link
						href='history'
						className='dark:bg-background flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10 dark:hover:bg-gray-600/20'
					>
						<TableCellsIcon />
						<p>History</p>
					</Link>
				</div>
			</div>
			<div className='my-10 text-center'>
				<h2 className='text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-gray-100'>
					Services Offered
				</h2>
			</div>
			<Services />
		</div>
	)
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Home />
		</Suspense>
	)
}

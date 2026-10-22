'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { EyeIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AirTank from '@/icons/AirTank'
import Services from '@/components/Home/Services'

function Home() {
	const searchParams = useSearchParams()

	useEffect(() => {
		if (searchParams.get('redirected') === 'true') {
			setTimeout(() => {
				window.dispatchEvent(new Event('open-login-modal'))
			}, 0)
			window.history.replaceState(null, '', '/')
		}
	}, [searchParams])
	return (
		<div className='w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
			<h1 className='text-text text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
				Dive Tec Fill Station Tracking
			</h1>
			<p className='text-light-text mx-auto mt-3 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl'>
				A simple site for keeping track of service that was done at the fill
				station
			</p>
			<div className='mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8'>
				<div className='grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl sm:grid-cols-3'>
					<Link
						href='fills'
						className='bg-card-hover hover:bg-hover flex min-h-16 cursor-pointer flex-row items-center gap-4 px-6 py-4 transition sm:flex-col sm:justify-between sm:gap-2 sm:p-10'
					>
						<AirTank />
						<p>Fills</p>
					</Link>
					<Link
						href='visual'
						className='bg-card-hover hover:bg-hover flex min-h-16 cursor-pointer flex-row items-center gap-4 px-6 py-4 transition sm:flex-col sm:justify-between sm:gap-2 sm:p-10'
					>
						<EyeIcon />
						<p>Visual</p>
					</Link>
					<Link
						href='history'
						className='bg-card-hover hover:bg-hover flex min-h-16 cursor-pointer flex-row items-center gap-4 px-6 py-4 transition sm:flex-col sm:justify-between sm:gap-2 sm:p-10'
					>
						<TableCellsIcon />
						<p>History</p>
					</Link>
				</div>
			</div>
			<div className='my-10 text-center'>
				<h2 className='text-text text-3xl font-semibold tracking-tight text-balance sm:text-5xl'>
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

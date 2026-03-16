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
		<div className='text-center'>
			<h1 className='text-text text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
				Dive Tec Fill Station Tracking
			</h1>
			<p className='text-light-text mx-auto mt-3 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl'>
				A simple site for keeping track of service that was done at the fill
				station
			</p>
			<div className='mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8'>
				<div className='-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3'>
					<Link
						href='fills'
						className='bg-card-hover hover:bg-hover flex cursor-pointer flex-col items-center justify-between gap-2 p-6 transition sm:p-10'
					>
						<AirTank />
						<p>Fills</p>
					</Link>
					<Link
						href='visual'
						className='bg-card-hover hover:bg-hover flex cursor-pointer flex-col items-center justify-between gap-2 p-6 transition sm:p-10'
					>
						<EyeIcon />
						<p>Visual</p>
					</Link>
					<Link
						href='history'
						className='bg-card-hover hover:bg-hover flex cursor-pointer flex-col items-center justify-between gap-2 p-6 transition sm:p-10'
					>
						<TableCellsIcon />
						<p>History</p>
					</Link>
				</div>
			</div>
			<div className='my-10 text-center'>
				<h2 className='text-text text-4xl font-semibold tracking-tight text-balance sm:text-5xl'>
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

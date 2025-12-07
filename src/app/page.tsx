import { EyeIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import React from 'react'
import Link from 'next/link'
import AirTank from '@/icons/AirTank'

export default function Home() {
	return (
		<div className='text-center'>
			<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl'>
				Marshalls Dive station tracking site
			</h1>
			<p className='mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl'>
				A simple site for keeping track of service that was done at the fill
				station
			</p>
			<div className='mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8'>
				<div className='-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3'>
					<Link
						href='fills'
						className='flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10'
					>
						<AirTank />
						<p>Fills</p>
					</Link>
					<Link
						href='visual'
						className='flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10'
					>
						<EyeIcon />
						<p>Visual</p>
					</Link>
					<Link
						href='history'
						className='flex cursor-pointer flex-col items-center justify-between gap-2 bg-gray-400/5 p-6 transition hover:bg-gray-400/10 sm:p-10'
					>
						<TableCellsIcon />
						<p>History</p>
					</Link>
				</div>
			</div>
		</div>
	)
}

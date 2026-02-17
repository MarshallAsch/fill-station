import {
	EyeIcon,
	TableCellsIcon,
	SparklesIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import React from 'react'
import Link from 'next/link'
import AirTank from '@/icons/AirTank'

export default function Home() {
	return (
		<div className='text-center'>
			<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl'>
				Dive Tec Fill Station Tracking
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
			<h3 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl'>
				Services Offered
			</h3>
			<div className='mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8'>
				<div className='-mx-6 grid grid-cols-3 gap-1 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-5'>
					<div>
						<AirTank />
						<p>Air</p>
					</div>

					<div>
						<AirTank />
						<p>Nitrox</p>
					</div>

					<div>
						<AirTank />
						<p>Oxygen</p>
					</div>

					<div>
						<AirTank />
						<p>Helium</p>
					</div>

					<div>
						<EyeIcon />
						<p>Visual Cylinder Inspections</p>
					</div>

					<div>
						<SparklesIcon />
						<p>Oxygen Clean Cylinder + valves</p>
					</div>

					<div>
						<UserGroupIcon />
						<p>Training</p>
					</div>
				</div>
			</div>
		</div>
	)
}

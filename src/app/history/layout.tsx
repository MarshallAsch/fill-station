'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

import { ClockIcon, EyeIcon, UsersIcon } from '@heroicons/react/24/outline'
import AirTank from '@/icons/AirTank'
import { setSelectedTab, TAB } from '@/redux/history/historySlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'

const navigation = [
	{ name: 'Fills', value: TAB.FILLS, icon: AirTank },
	{ name: 'Visual Inspections', value: TAB.VIS_INSPECTION, icon: EyeIcon },
	{ name: 'Client List', value: TAB.CLIENTS, icon: UsersIcon },
	{
		name: 'Compressor Maintenance',
		value: TAB.COMP_MAINTENANCE,
		icon: ClockIcon,
	},
]

const Layout = ({ children }: { children: ReactNode }) => {
	const { selectedTab } = useAppSelector((state) => state.history)
	const dispatch = useAppDispatch()

	const handleClick = (val: TAB) => {
		dispatch(setSelectedTab(val))
	}
	return (
		<div className='flex grow border-t border-gray-200'>
			{/* Static sidebar for desktop */}
			<div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col'>
				{/* Sidebar component, swap this element with another sidebar if you like */}
				<div className='mt-24 flex grow flex-col gap-y-5 overflow-y-auto border-t border-r border-gray-200 bg-white px-6'>
					<nav className='flex flex-1 flex-col'>
						<ul role='list' className='flex flex-1 flex-col gap-y-7'>
							<li>
								<ul role='list' className='flex flex-1 flex-col gap-y-7'>
									<li>
										<ul role='list' className='-mx-2 space-y-1'>
											{navigation.map((item) => (
												<li key={item.name}>
													<button
														onClick={() => handleClick(item.value)}
														className={clsx(
															item.value === selectedTab
																? 'bg-gray-50 text-indigo-600'
																: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
															'group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
														)}
													>
														<item.icon
															aria-hidden='true'
															className={clsx(
																item.value === selectedTab
																	? 'text-indigo-600'
																	: 'text-gray-400 group-hover:text-indigo-600',
																'size-6 shrink-0',
															)}
														/>
														{item.name}
													</button>
												</li>
											))}
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</nav>
				</div>
			</div>

			<div className='min-w-full py-10 lg:pl-72'>
				<div className='flex justify-center px-4 sm:px-6 lg:px-8'>
					{children}
				</div>
			</div>
		</div>
	)
}

export default Layout

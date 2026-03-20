'use client'

import { ReactNode, Suspense } from 'react'
import clsx from 'clsx'
import {
	WrenchScrewdriverIcon,
	BellIcon,
	UsersIcon,
	ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import AirTank from '@/icons/AirTank'
import { useRouter, useSearchParams } from 'next/navigation'

export enum SETTINGS_TAB {
	INSPECTION = 'INSPECTION',
	CYLINDERS = 'CYLINDERS',
	NOTIFICATIONS = 'NOTIFICATIONS',
	USERS = 'USERS',
	AUDIT_LOG = 'AUDIT_LOG',
}

const navigation = [
	{
		name: 'Inspection & Maintenance',
		value: SETTINGS_TAB.INSPECTION,
		icon: WrenchScrewdriverIcon,
	},
	{
		name: 'Cylinder Defaults',
		value: SETTINGS_TAB.CYLINDERS,
		icon: AirTank,
	},
	{
		name: 'Notifications',
		value: SETTINGS_TAB.NOTIFICATIONS,
		icon: BellIcon,
	},
	{ name: 'Users', value: SETTINGS_TAB.USERS, icon: UsersIcon },
	{
		name: 'Audit Log',
		value: SETTINGS_TAB.AUDIT_LOG,
		icon: ClipboardDocumentListIcon,
	},
]

const LayoutContent = ({ children }: { children: ReactNode }) => {
	const router = useRouter()
	const params = useSearchParams()

	const tab = params.get('tab')

	const selectedTab = (Object.values(SETTINGS_TAB) as Array<unknown>).includes(
		tab,
	)
		? tab
		: SETTINGS_TAB.INSPECTION

	return (
		<div className='border-border flex grow border-t'>
			<div className='fixed inset-y-0 z-50 flex w-72 flex-col'>
				<div className='border-border bg-background mt-24 flex grow flex-col gap-y-5 overflow-y-auto border-t border-r px-6'>
					<nav className='flex flex-1 flex-col'>
						<ul role='list' className='flex flex-1 flex-col gap-y-7'>
							<li>
								<ul role='list' className='flex flex-1 flex-col gap-y-7'>
									<li>
										<ul role='list' className='-mx-2 mt-2 space-y-1'>
											{navigation.map((item) => (
												<li key={item.name}>
													<button
														onClick={() =>
															router.push(`/settings?tab=${item.value}`)
														}
														className={clsx(
															item.value === selectedTab
																? 'bg-surface text-accent-text'
																: 'text-text hover:bg-hover hover:text-accent-text',
															'group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
														)}
													>
														<item.icon
															aria-hidden='true'
															className={clsx(
																item.value === selectedTab
																	? 'text-accent-text'
																	: 'text-muted-text group-hover:text-accent-text',
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

			<div className='min-w-full py-10 pl-72'>
				<div className='flex justify-center px-4 sm:px-6 lg:px-8'>
					{children}
				</div>
			</div>
		</div>
	)
}

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LayoutContent>{children}</LayoutContent>
		</Suspense>
	)
}

export default Layout

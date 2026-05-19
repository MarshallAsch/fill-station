'use client'

import { ReactNode, Suspense, useState } from 'react'
import clsx from 'clsx'

import {
	Bars3Icon,
	ClockIcon,
	EyeIcon,
	UsersIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import AirTank from '@/icons/AirTank'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogPanel } from '@headlessui/react'

export enum TAB {
	FILLS = 'FILLS',
	VIS_INSPECTION = 'VISUAL_INSPECTION',
	COMP_MAINTENANCE = 'COMPRESSOR_MAINTENANCE',
	CLIENTS = 'CLIENTS',
	CYLINDERS = 'CYLINDERS',
}

const navigation = [
	{ name: 'Fills', value: TAB.FILLS, icon: AirTank },
	{ name: 'Visual Inspections', value: TAB.VIS_INSPECTION, icon: EyeIcon },
	{ name: 'Client List', value: TAB.CLIENTS, icon: UsersIcon },
	{ name: 'Cylinder List', value: TAB.CYLINDERS, icon: AirTank },
	{
		name: 'Compressor Maintenance',
		value: TAB.COMP_MAINTENANCE,
		icon: ClockIcon,
	},
]

type NavListProps = {
	selectedTab: string
	onSelect: (value: TAB) => void
}

const NavList = ({ selectedTab, onSelect }: NavListProps) => (
	<ul role='list' className='-mx-2 mt-2 space-y-1'>
		{navigation.map((item) => (
			<li key={item.name}>
				<button
					onClick={() => onSelect(item.value)}
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
)

const LayoutContent = ({ children }: { children: ReactNode }) => {
	const router = useRouter()
	const params = useSearchParams()
	const [mobileNavOpen, setMobileNavOpen] = useState(false)

	const tab = params.get('tab')

	const selectedTab = (Object.values(TAB) as Array<unknown>).includes(tab)
		? (tab as string)
		: TAB.FILLS

	const selectedName =
		navigation.find((n) => n.value === selectedTab)?.name ?? 'History'

	const handleSelect = (value: TAB) => {
		router.push(`/history?tab=${value}`)
		setMobileNavOpen(false)
	}

	return (
		<div className='border-border flex grow border-t'>
			{/* Desktop sidebar */}
			<div className='fixed inset-y-0 z-50 hidden w-72 flex-col lg:flex'>
				<div className='border-border bg-background mt-24 flex grow flex-col gap-y-5 overflow-y-auto border-t border-r px-6'>
					<nav className='flex flex-1 flex-col'>
						<NavList selectedTab={selectedTab} onSelect={handleSelect} />
					</nav>
				</div>
			</div>

			<div className='min-w-full py-6 lg:py-10 lg:pl-72'>
				{/* Mobile tab bar */}
				<div className='border-border bg-background flex items-center justify-between border-b px-4 py-3 lg:hidden'>
					<span className='text-text text-base font-semibold'>
						{selectedName}
					</span>
					<button
						type='button'
						onClick={() => setMobileNavOpen(true)}
						className='text-text hover:bg-hover -m-2 inline-flex cursor-pointer items-center justify-center rounded-md p-2'
					>
						<span className='sr-only'>Open history menu</span>
						<Bars3Icon aria-hidden='true' className='size-6' />
					</button>
				</div>

				<div className='flex justify-center px-4 sm:px-6 lg:px-8'>
					{children}
				</div>
			</div>

			{/* Mobile drawer */}
			<Dialog
				open={mobileNavOpen}
				onClose={setMobileNavOpen}
				className='lg:hidden'
			>
				<div className='fixed inset-0 z-50 bg-black/30' aria-hidden='true' />
				<DialogPanel className='bg-background sm:ring-border fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto p-6 sm:ring-1'>
					<div className='flex items-center justify-between'>
						<span className='text-text text-base font-semibold'>History</span>
						<button
							type='button'
							onClick={() => setMobileNavOpen(false)}
							className='text-text hover:bg-hover -m-2 rounded-md p-2'
						>
							<span className='sr-only'>Close menu</span>
							<XMarkIcon aria-hidden='true' className='size-6' />
						</button>
					</div>
					<nav className='mt-6'>
						<NavList selectedTab={selectedTab} onSelect={handleSelect} />
					</nav>
				</DialogPanel>
			</Dialog>
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

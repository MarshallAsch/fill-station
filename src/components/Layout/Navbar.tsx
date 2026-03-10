'use client'

import Link from 'next/link'
import LogoIcon from '../LogoIcon'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'

import Login from '../UI/Login'
import { useSession } from 'next-auth/react'

const navigation = [
	{ name: 'Fills', href: '/fills' },
	{ name: 'Visual', href: '/visual' },
	{ name: 'History', href: '/history' },
	{ name: 'Clients', href: '/clients' },
]

const Navbar = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const session = useSession()

	return (
		<header className='sticky top-0 z-9999 bg-white'>
			<nav
				aria-label='Global'
				className='mx-auto flex max-w-7xl items-center justify-between bg-white p-6 lg:px-8'
			>
				<Link href='/' className='-m-1.5 p-1.5'>
					<span className='sr-only'>Marshalls Dive Station</span>
					<LogoIcon />
				</Link>
				{session.status !== 'authenticated' ? (
					<Link href='/about' className='text-sm/6 font-semibold text-gray-900'>
						About
					</Link>
				) : (
					<>
						<div className='flex lg:hidden'>
							<button
								type='button'
								onClick={() => setMobileMenuOpen(true)}
								className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
							>
								<span className='sr-only'>Open main menu</span>
								<Bars3Icon aria-hidden='true' className='size-6' />
							</button>
						</div>
						<div className='hidden lg:flex lg:gap-x-12'>
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className='text-sm/6 font-semibold text-gray-900'
								>
									{item.name}
								</Link>
							))}
							<Link
								href='/about'
								className='text-sm/6 font-semibold text-gray-900'
							>
								About
							</Link>
						</div>
					</>
				)}
				<div>
					<Login />
				</div>
			</nav>
			<Dialog
				open={mobileMenuOpen}
				onClose={setMobileMenuOpen}
				className='lg:hidden'
			>
				<div className='fixed inset-0 z-50' />
				<DialogPanel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
					<div className='flex items-center justify-between'>
						<a href='#' className='-m-1.5 p-1.5'>
							<span className='sr-only'>Marshalls Dive Station</span>
							<LogoIcon />
						</a>
						<button
							type='button'
							onClick={() => setMobileMenuOpen(false)}
							className='-m-2.5 rounded-md p-2.5 text-gray-700'
						>
							<span className='sr-only'>Close menu</span>
							<XMarkIcon aria-hidden='true' className='size-6' />
						</button>
					</div>
					<div className='mt-6 flow-root'>
						<div className='-my-6 divide-y divide-gray-500/10'>
							<div className='space-y-2 py-6'>
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className='-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50'
									>
										{item.name}
									</Link>
								))}
								<Link
									href='/about'
									className='text-sm/6 font-semibold text-gray-900'
								>
									About
								</Link>
							</div>
							<Login />
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		</header>
	)
}

export default Navbar

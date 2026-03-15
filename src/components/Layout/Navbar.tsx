'use client'

import Link from 'next/link'
import LogoIcon from '../LogoIcon'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'

import Login from '../UI/Login'
import { useSession } from 'next-auth/react'
import { getNavItems, Role } from '@/lib/permissions'

const Navbar = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const session = useSession()
	const role = (session?.data?.user?.role ?? 'user') as Role
	const navigation = getNavItems(role)

	return (
		<header className='bg-background sticky top-0 z-9999'>
			<nav
				aria-label='Global'
				className='bg-background mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8'
			>
				<Link href='/' className='-m-1.5 p-1.5'>
					<span className='sr-only'>Marshalls Dive Station</span>
					<LogoIcon />
				</Link>
				{session.status !== 'authenticated' ? (
					<Link href='/about' className='text-text text-sm/6 font-semibold'>
						About
					</Link>
				) : (
					<>
						<div className='flex lg:hidden'>
							<button
								type='button'
								onClick={() => setMobileMenuOpen(true)}
								className='text-text -m-2.5 inline-flex items-center justify-center rounded-md p-2.5'
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
									className='text-text text-sm/6 font-semibold'
								>
									{item.name}
								</Link>
							))}
							<Link href='/about' className='text-text text-sm/6 font-semibold'>
								About
							</Link>
							<Link
								href='/contact'
								className='text-text text-sm/6 font-semibold'
							>
								Contact
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
				<DialogPanel className='bg-background sm:ring-border fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-6 sm:max-w-sm sm:ring-1'>
					<div className='flex items-center justify-between'>
						<a href='#' className='-m-1.5 p-1.5'>
							<span className='sr-only'>Marshalls Dive Station</span>
							<LogoIcon />
						</a>
						<button
							type='button'
							onClick={() => setMobileMenuOpen(false)}
							className='text-text -m-2.5 rounded-md p-2.5'
						>
							<span className='sr-only'>Close menu</span>
							<XMarkIcon aria-hidden='true' className='size-6' />
						</button>
					</div>
					<div className='mt-6 flow-root'>
						<div className='divide-divider -my-6 divide-y'>
							<div className='space-y-2 py-6'>
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className='text-text hover:bg-hover -mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold'
									>
										{item.name}
									</Link>
								))}
								<Link
									href='/about'
									className='text-text text-sm/6 font-semibold'
								>
									About
								</Link>
								<Link
									href='/contact'
									className='text-text text-sm/6 font-semibold'
								>
									Contact
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

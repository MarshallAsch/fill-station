import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/20/solid'
import { signOut } from 'next-auth/react'

const userNavigation = [
	{ name: 'Your profile', href: '#' },
	{ name: 'Settings', href: '#' },
]

const ProfileButton = () => {
	return (
		<Menu as='div' className='relative ml-3'>
			<MenuButton className='relative flex max-w-xs cursor-pointer items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
				<span className='absolute -inset-1.5' />
				<span className='sr-only'>Open user menu</span>
				{/* Temporary profile icon/picture */}
				<UserIcon className='h-10 w-10 rounded-full border border-green-500 text-green-500' />
			</MenuButton>

			<MenuItems
				transition
				className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in'
			>
				{userNavigation.map((item) => (
					<MenuItem key={item.name}>
						<a
							href={item.href}
							className='block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden'
						>
							{item.name}
						</a>
					</MenuItem>
				))}
				<MenuItem>
					<button
						onClick={() => signOut()}
						className='block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden'
					>
						Sign out
					</button>
				</MenuItem>
			</MenuItems>
		</Menu>
	)
}

export default ProfileButton

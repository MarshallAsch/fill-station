import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/20/solid'
import { signOut, useSession } from 'next-auth/react'

const ProfileButton = () => {
	const { data: session } = useSession()
	const isAdmin = session?.user?.role === 'admin'

	return (
		<Menu as='div' className='relative ml-3'>
			<MenuButton className='focus-visible:outline-accent relative flex max-w-xs cursor-pointer items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2'>
				<span className='absolute -inset-1.5' />
				<span className='sr-only'>Open user menu</span>
				{/* Temporary profile icon/picture */}
				<UserIcon className='h-10 w-10 rounded-full border border-green-500 text-green-500' />
			</MenuButton>

			<MenuItems
				transition
				className='bg-background absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in'
			>
				<MenuItem>
					<a
						href='/profile'
						className='text-text data-focus:bg-hover block px-4 py-2 text-sm data-focus:outline-hidden'
					>
						Your profile
					</a>
				</MenuItem>
				{isAdmin && (
					<MenuItem>
						<a
							href='/settings'
							className='text-text data-focus:bg-hover block px-4 py-2 text-sm data-focus:outline-hidden'
						>
							Admin Settings
						</a>
					</MenuItem>
				)}
				<MenuItem>
					<button
						onClick={() => signOut()}
						className='text-text data-focus:bg-hover block w-full cursor-pointer px-4 py-2 text-left text-sm data-focus:outline-hidden'
					>
						Sign out
					</button>
				</MenuItem>
			</MenuItems>
		</Menu>
	)
}

export default ProfileButton

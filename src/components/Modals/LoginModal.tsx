'use client'

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import { signIn } from 'next-auth/react'
import Button from '../UI/Button'

type LoginModalProps = {
	open: boolean
	onClose: () => void
}

// Provider list must stay in sync with src/auth.ts
const providers = [
	{ id: 'google', name: 'Google' },
	{ id: 'authelia', name: 'Marshalls Lab' },
]

const LoginModal = ({ open, onClose }: LoginModalProps) => {
	return (
		<Transition show={open} as={Fragment}>
			<Dialog as='div' onClose={onClose} className='relative z-50'>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='bg-overlay fixed inset-0 transition-opacity' />
				</TransitionChild>
				<div className='fixed inset-0 z-50 overflow-y-auto'>
					<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
						<TransitionChild
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						>
							<DialogPanel className='bg-background relative transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
								<DialogTitle className='text-text text-center text-lg font-semibold'>
									Sign in to Fill Station
								</DialogTitle>
								<div className='mt-6 flex flex-col gap-3'>
									{providers.map((provider) => (
										<Button
											key={provider.id}
											onClick={() => signIn(provider.id)}
											className='w-full justify-center'
										>
											Sign in with {provider.name}
										</Button>
									))}
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default LoginModal

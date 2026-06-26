'use client'

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import RealGasToggle from './RealGasToggle'
import TemperatureControl from './TemperatureControl'
import UnitToggle from './UnitToggle'

const SettingsModal = ({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) => {
	return (
		<Transition show={open} as={Fragment}>
			<Dialog onClose={onClose} className='relative z-50'>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-200'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-150'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black/40' aria-hidden='true' />
				</TransitionChild>
				<div className='fixed inset-0 flex items-center justify-center p-4'>
					<TransitionChild
						as={Fragment}
						enter='ease-out duration-200'
						enterFrom='opacity-0 scale-95'
						enterTo='opacity-100 scale-100'
						leave='ease-in duration-150'
						leaveFrom='opacity-100 scale-100'
						leaveTo='opacity-0 scale-95'
					>
						<DialogPanel className='bg-background border-border w-full max-w-md space-y-5 rounded-lg border p-6 shadow-xl'>
							<DialogTitle className='text-text text-lg font-semibold'>
								Settings
							</DialogTitle>
							<div className='space-y-2'>
								<h3 className='text-light-text text-xs font-medium'>Units</h3>
								<UnitToggle
									show={['pressure', 'depth', 'volume', 'airFlow', 'temp']}
								/>
							</div>
							<div className='space-y-2'>
								<h3 className='text-light-text text-xs font-medium'>
									Gas model
								</h3>
								<RealGasToggle />
							</div>
							<TemperatureControl />
							<div className='flex justify-end'>
								<button
									type='button'
									onClick={onClose}
									className='bg-accent text-white-text rounded-md px-4 py-2 text-sm font-medium'
								>
									Done
								</button>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	)
}

export default SettingsModal

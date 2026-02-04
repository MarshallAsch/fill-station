'use client'

import { Button } from '@headlessui/react'
import ClientListTable from '@/components/History/components/ClientListTable'
import { useAppDispatch } from '@/redux/hooks'
import { updateAddClientModalOpen } from '@/redux/modal/modalSlice'

export default function Clients() {
	const dispatch = useAppDispatch()
	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						List of all the clients
					</h1>
				</div>
				<Button
					onClick={() => dispatch(updateAddClientModalOpen(true))}
					className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
				>
					Add new Client
				</Button>

				<ClientListTable />
			</div>
		</div>
	)
}

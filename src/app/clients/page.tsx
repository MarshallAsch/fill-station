'use client'

import ClientListTable from '@/components/History/components/ClientListTable'
import Button from '@/components/UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import { updateAddClientModalOpen } from '@/redux/modal/modalSlice'
import { useSession } from 'next-auth/react'

export default function Clients() {
	const dispatch = useAppDispatch()
	const session = useSession()
	if (session.status !== 'authenticated') {
		return <div>Not Authorized</div>
	}

	return (
		<div className='w-full max-w-7xl'>
			<div className='my-4 flex min-w-full flex-col items-center justify-center gap-3'>
				<h1 className='text-3xl'>List of all the clients</h1>

				<div>
					<Button onClick={() => dispatch(updateAddClientModalOpen(true))}>
						Add new Client
					</Button>
				</div>

				<div className='min-w-full'>
					<ClientListTable />
				</div>
			</div>
		</div>
	)
}

'use client'

import React from 'react'
import DatePicker from '@/components/UI/FormElements/DatePicker'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import FillsTable from '@/components/Fills/FillsTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import useLoadClients from '@/hooks/useLoadClients'
import { setSelectedClient } from '@/redux/client/clientSlice'

export default function Fills() {
	const dispatch = useAppDispatch()
	const client = useAppSelector((state) => state.clients.selectedClient)

	const { clients } = useLoadClients()

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-3'>
				<h1 className='text-3xl'>Record a Tank Fill</h1>

				<div className='flex gap-2'>
					<DatePicker title='Fill Date' name='fillDate' id='fill-date' />
					<ClientPicker
						clients={clients}
						onChange={(c) => dispatch(setSelectedClient(c))}
					/>
				</div>

				<FillsTable client={client} />
			</div>
		</div>
	)
}

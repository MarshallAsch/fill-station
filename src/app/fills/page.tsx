'use client'

import React, { useState } from 'react'
import DatePicker from '@/components/UI/FormElements/DatePicker'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import FillsTable from '@/components/Fills/FillsTable'
import { Client } from '@/types/client'

export default function Fills() {
	const [client, setClient] = useState<Client>()

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-3'>
				<h1 className='text-3xl'>Record a Tank Fill</h1>

				<div className='flex gap-2'>
					<DatePicker title='Fill Date' name='fillDate' id='fill-date' />
					<ClientPicker onChange={(c) => setClient(c)} />
				</div>

				<FillsTable client={client} />
			</div>
		</div>
	)
}

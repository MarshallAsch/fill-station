'use client'

import React from 'react'
import DatePicker from '@/components/UI/FormElements/DatePicker'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import FillsTable from '@/components/Fills/FillsTable'

export default function Fills() {
	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-3'>
				<h1 className='text-3xl'>Record a Tank Fill</h1>

				<div className='flex gap-2'>
					<DatePicker title='Fill Date' name='fillDate' id='fill-date' />
					<ClientPicker />
				</div>

				<FillsTable />
			</div>
		</div>
	)
}

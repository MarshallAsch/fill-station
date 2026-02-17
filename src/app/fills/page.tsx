'use client'

import React from 'react'
import DatePicker from '@/components/UI/FormElements/DatePicker'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import FillsTable from '@/components/Fills/FillsTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateClient } from '@/redux/fills/fillsSlice'

export default function Fills() {
	const dispatch = useAppDispatch()
	const client = useAppSelector((state) => state.fills).client

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-3'>
				<h1 className='text-3xl'>Record a Tank Fill</h1>

				<div className='flex gap-2'>
					<DatePicker title='Fill Date' name='fillDate' id='fill-date' />
					<ClientPicker
						initialValue={client}
						onChange={(c) => dispatch(updateClient(c))}
					/>
				</div>

				<FillsTable client={client} />
			</div>
		</div>
	)
}

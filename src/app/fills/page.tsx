'use client'

import React from 'react'
import DatePicker from '@/components/UI/FormElements/DatePicker'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import FillsTable from '@/components/Fills/FillsTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import useLoadClients from '@/hooks/useLoadClients'
import { setSelectedClient } from '@/redux/client/clientSlice'
import { FillDto } from '../api/fills/route'
import { addNewFill } from '../_api'
import dayjs from 'dayjs'
import { resetFills } from '@/redux/fills/fillsSlice'

export default function Fills() {
	const dispatch = useAppDispatch()
	const client = useAppSelector((state) => state.clients.selectedClient)

	const fills = useAppSelector((state) => state.fills.fills)

	const { clients } = useLoadClients()

	const handleSubmit = async (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const { fillDate } = formData

		const fillData: FillDto[] = fills.map((fill) => {
			return {
				date: dayjs(fillDate as string),
				cylinderId: fill.cylinder?.id,
				startPressure: fill.start,
				endPressure: fill.end,
				oxygen: fill.o2,
				helium: fill.he,
			}
		})

		const data = await addNewFill(fillData)

		if (!data.error) {
			dispatch(resetFills())
		}
	}

	return (
		<div className='max-w-7xl'>
			<form
				action={handleSubmit}
				className='my-4 flex flex-col items-center justify-center gap-3'
			>
				<h1 className='text-3xl'>Record a Tank Fill</h1>

				<div className='flex gap-2'>
					<DatePicker title='Fill Date' name='fillDate' id='fill-date' />
					<ClientPicker
						clients={clients}
						onChange={(c) => dispatch(setSelectedClient(c))}
					/>
				</div>

				<FillsTable client={client} />
			</form>
		</div>
	)
}

'use client'

import CylinderPicker from '@/components/UI/FormElements/CylinderPicker'
import TankInfo from '@/components/Visual/TankInfo'
import VisualInfo from '@/components/Visual/VisualInfo'
import External from '@/components/Visual/External'
import Internal from '@/components/Visual/Internal'
import Threading from '@/components/Visual/Threading'
import Valve from '@/components/Visual/Valve'
import FinalStatus from '@/components/Visual/FinalStatus'
import { FormEvent } from 'react'
import Button from '@/components/UI/Button'
import { useAppSelector } from '@/redux/hooks'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import { newVisual } from '../_api'
import { useQueryClient } from '@tanstack/react-query'

export default function Visual() {
	const queryClient = useQueryClient()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// For this to work properly, the name provided to each input should be unique and match the schema on the BE
		const form = new FormData(event.target as HTMLFormElement)
		const formData = Object.fromEntries(form.entries())

		let cylinder = cylinders.find((c) => c.serialNumber == formData.cylinder)

		console.log(cylinder?.id)
		console.log(formData)

		if (!cylinder) {
			return
		}

		const data = newVisual(cylinder.id, formData)
		if (!(data instanceof String)) {
			queryClient.invalidateQueries({ queryKey: ['fills'] })
		}
	}
	const client = useAppSelector((state) => state.clients.selectedClient)
	const { cylinders } = useAppSelector((state) => state.cylinders)

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						Record a Tank Vis
					</h1>
				</div>

				<form onSubmit={handleSubmit}>
					<div className='flex w-full justify-center gap-6'>
						<ClientPicker />
						<CylinderPicker filter={(c) => !client || client.id == c.ownerId} />
					</div>

					<TankInfo />

					<VisualInfo />

					<External />

					<Internal />

					<Threading />

					<Valve />

					<FinalStatus />

					<div className='flex w-full justify-end py-10'>
						<div className='w-40'>
							<Button type='submit'>Submit</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

'use client'

import CylinderPicker from '@/components/UI/FormElements/CylinderPicker'
import TankInfo from '@/components/Visual/TankInfo'
import VisualInfo from '@/components/Visual/VisualInfo'
import External from '@/components/Visual/External'
import Internal from '@/components/Visual/Internal'
import Threading from '@/components/Visual/Threading'
import Valve from '@/components/Visual/Valve'
import FinalStatus from '@/components/Visual/FinalStatus'
import { useState } from 'react'
import Button from '@/components/UI/Button'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import { Client } from '@/types/client'
import { Cylinder } from '@/types/cylinder'

export default function Visual() {
	const [client, setClient] = useState<Client>()
	const [cylinder, setCylinder] = useState<Cylinder>()

	const handleSubmit = (form: FormData) => {
		const formData = Object.fromEntries(form.entries())
		console.log(formData)
	}

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						Record a Tank Vis
					</h1>
				</div>

				<form action={handleSubmit}>
					<div className='flex w-full justify-center gap-6'>
						<ClientPicker onChange={(c) => setClient(c)} />
						<CylinderPicker
							onChange={(c) => setCylinder(c)}
							filter={(c) => !client || client.id == c.ownerId}
						/>
					</div>

					<TankInfo cylinder={cylinder} />

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

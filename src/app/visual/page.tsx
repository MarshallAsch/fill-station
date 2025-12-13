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
import { Button } from '@headlessui/react'

export default function Visual() {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// For this to work properly, the name provided to each input should be unique and match the schema on the BE
		const form = new FormData(event.target as HTMLFormElement)
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

				<form onSubmit={handleSubmit}>
					<div className='flex w-full justify-center'>
						<CylinderPicker />
					</div>

					<TankInfo />

					<VisualInfo />

					<External />

					<Internal />

					<Threading />

					<Valve />

					<FinalStatus />

					<div className='flex w-full justify-end py-10'>
						<Button
							className='cursor-pointer rounded-lg bg-blue-600 px-2.5 py-2 text-white hover:bg-blue-700'
							type='submit'
						>
							Submit
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

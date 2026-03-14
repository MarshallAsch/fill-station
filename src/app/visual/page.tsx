'use client'

import CylinderPicker from '@/components/UI/FormElements/CylinderPicker'
import TankInfo from '@/components/Visual/TankInfo'
import VisualInfo from '@/components/Visual/VisualInfo'
import External from '@/components/Visual/External'
import Internal from '@/components/Visual/Internal'
import Threading from '@/components/Visual/Threading'
import Valve from '@/components/Visual/Valve'
import FinalStatus from '@/components/Visual/FinalStatus'
import Button from '@/components/UI/Button'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateCylinder } from '@/redux/visuals/visualsSlice'
import { toast } from 'react-toastify'
import { NewVisualDTO } from '@/types/visuals'
import { newVisual } from '../_api'
import { useQueryClient } from '@tanstack/react-query'

export default function Visual() {
	const dispatch = useAppDispatch()
	const { cylinder } = useAppSelector((state) => state.visuals)
	const { selectedClient: client, selectedInspector: inspector } =
		useAppSelector((state) => state.clients)
	const queryClient = useQueryClient()

	const handleSubmit = async (form: FormData) => {
		const formData: any = Object.fromEntries(form.entries())
		formData.inspectorId = inspector?.id

		const booleanFields = [
			'heat',
			'painted',
			'odor',
			'bow',
			'bulges',
			'bell',
			'lineCorrosion',
			'burstDiskReplaced',
			'oringReplaced',
			'dipTube',
			'needService',
			'rebuilt',
			'oxygenCleaned',
			'markedOxygenClean',
		]
		booleanFields.forEach((field) => {
			formData[field] = formData[field] === '1'
		})

		formData.badThreadCount = parseInt(formData.badThreadCount, 10)

		if (cylinder) {
			const data = await newVisual(cylinder.id, formData as NewVisualDTO)

			if (typeof data !== 'string') {
				toast.success('Saved new Visual Inspection')
				queryClient.invalidateQueries({ queryKey: ['visuals'] })
			} else {
				toast.error(`Failed to create Inspection: ${data}`)
			}
		} else {
			toast.error(`Must select n cylinder`)
		}
	}

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900 dark:text-gray-100'>
						Record a Tank Vis
					</h1>
				</div>

				<form action={handleSubmit}>
					<div className='flex w-full justify-center gap-6'>
						<ClientPicker />
						<CylinderPicker
							initialValue={cylinder}
							onChange={(c) => dispatch(updateCylinder(c))}
							filter={(c) => !client || client.id == c.ownerId}
							visPage={true}
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

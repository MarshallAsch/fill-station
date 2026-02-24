'use server'

import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FormGroup from '@/components/UI/FormGroup'
import PropertyRow from '@/components/VisHistory/PropertyRow'
import { Client } from '@/lib/models/client'
import { Cylinder } from '@/types/cylinder'
import dayjs from 'dayjs'

export default async function ClientDetails({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: clientId } = await params

	const client = await Client.findByPk(clientId)

	const cylinders: Cylinder[] = !client
		? []
		: client.Cylinders?.map((data) => {
				return {
					...data,
					id: data.id,
					birth: data.birth ? dayjs(data.birth).toISOString() : '',
					lastHydro: data.lastHydro ? dayjs(data.lastHydro).toISOString() : '',
					lastVis: data.lastVis ? dayjs(data.lastVis).toISOString() : '',
					createdAt: data.createdAt ? dayjs(data.createdAt).toISOString() : '',
					updatedAt: data.updatedAt ? dayjs(data.updatedAt).toISOString() : '',
					material: (data.material === 'steel' || data.material === 'aluminum' || data.material === 'composite')
						? data.material
						: undefined,
				} as Cylinder
			}) || []

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						Client Details: {client?.name}
					</h1>
				</div>

				<FormGroup title='Certifications'>
					<div className='flex flex-col gap-2'>
						<PropertyRow title='Nitrox' text={client?.nitroxCert || 'None'} />
						<PropertyRow
							title='Advanced Nitrox'
							text={client?.advancedNitroxCert || 'None'}
						/>
						<PropertyRow title='Trimix' text={client?.trimixCert || 'None'} />
						<PropertyRow
							title='Inspection'
							text={client?.inspectionCert || 'None'}
						/>
						<PropertyRow title='Total Fills' text='0' />
					</div>
				</FormGroup>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-2xl font-semibold text-gray-900'>Cylinders</h1>
				</div>

				<CylinderListTable cylinders={cylinders} />
			</div>
		</div>
	)
}

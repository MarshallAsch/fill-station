'use server'

import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FormGroup from '@/components/UI/FormGroup'
import PropertyRow from '@/components/VisHistory/PropertyRow'
import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'

export default async function ClientDetails({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: clientId } = await params

	const client = await Client.findByPk(clientId, {
		include: Cylinder,
	})

	const cylinders: Cylinder[] = client?.Cylinders || []
	const cylinderIds = cylinders.map((c) => c.id)
	const totalFills =
		cylinderIds.length > 0
			? await Fill.count({ where: { CylinderId: cylinderIds } })
			: 0

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-text text-4xl font-semibold'>
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
						<PropertyRow title='Total Fills' text={String(totalFills)} />
					</div>
				</FormGroup>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-text text-2xl font-semibold'>Cylinders</h1>
				</div>

				<CylinderListTable cylinders={cylinders} />
			</div>
		</div>
	)
}

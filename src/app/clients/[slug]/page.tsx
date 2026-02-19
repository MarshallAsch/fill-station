'use server'

import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FormGroup from '@/components/UI/FormGroup'
import PropertyRow from '@/components/VisHistory/PropertyRow'
import { Client } from '@/lib/models/client'

export default async function ClientDetails({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: clientId } = await params

	let client = await Client.findByPk(clientId)

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

				<CylinderListTable cylinders={client?.Cylinders || []} />
			</div>
		</div>
	)
}

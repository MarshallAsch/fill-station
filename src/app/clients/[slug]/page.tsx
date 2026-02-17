'use server'

import { auth } from '@/auth'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'

export default async function ClientDetails({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const session = await auth()
	if (!session) {
		return <div>Not Authorized</div>
	}

	const { slug: clientId } = await params

	let client = await Client.findByPk(clientId, { include: Cylinder })

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						Client Details: {client?.name}
					</h1>
				</div>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-2xl font-semibold text-gray-900'>
						Certifications
					</h1>
				</div>
				Nitrox: {client?.nitroxCert || 'None'}
				<br />
				Advanced Nitrox: {client?.advancedNitroxCert || 'None'}
				<br />
				Trimix: {client?.trimixCert || 'None'}
				<br />
				Inspection: {client?.inspectionCert || 'None'}
			</div>

			<div className='flex flex-col items-center justify-center gap-3 py-6'>
				<h1 className='text-2xl font-semibold text-gray-900'>Cylinders</h1>
			</div>

			<CylinderListTable cylinders={client?.Cylinders || []} />
		</div>
	)
}

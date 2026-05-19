'use server'

import AddCylinderButton from '@/components/Dashboard/AddCylinderButton'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FillHistoryTable from '@/components/History/components/FillHistoryTable'
import FormGroup from '@/components/UI/FormGroup'
import PropertyRow from '@/components/VisHistory/PropertyRow'
import ClientDetailsTabs, {
	ClientDetailsTab,
} from '@/components/Clients/ClientDetailsTabs'
import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'

const isTab = (value: unknown): value is ClientDetailsTab =>
	value === 'cylinders' || value === 'fills'

export default async function ClientDetails({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ tab?: string }>
}) {
	const { slug: clientId } = await params
	const { tab } = await searchParams
	const activeTab: ClientDetailsTab = isTab(tab) ? tab : 'cylinders'

	const client = await Client.findByPk(clientId, {
		include: Cylinder,
	})

	const cylinders: Cylinder[] = client?.Cylinders || []
	const cylinderIds = cylinders.map((c) => c.id)
	const totalFills =
		cylinderIds.length > 0
			? await Fill.count({ where: { CylinderId: cylinderIds } })
			: 0

	const fills =
		activeTab === 'fills' && cylinderIds.length > 0
			? await Fill.findAll({
					where: { CylinderId: cylinderIds },
					include: [{ model: Cylinder }],
					order: [['date', 'DESC']],
				})
			: []

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

				<div className='mt-6'>
					<ClientDetailsTabs clientId={clientId} activeTab={activeTab} />
				</div>

				{activeTab === 'cylinders' ? (
					<>
						{client && (
							<div className='mt-4 flex w-full justify-end px-6'>
								<AddCylinderButton
									client={JSON.parse(JSON.stringify(client))}
								/>
							</div>
						)}
						<CylinderListTable cylinders={cylinders} />
					</>
				) : (
					<FillHistoryTable fills={JSON.parse(JSON.stringify(fills))} />
				)}
			</div>
		</div>
	)
}

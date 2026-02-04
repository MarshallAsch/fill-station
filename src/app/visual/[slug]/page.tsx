'use server'

import FormGroup from '@/components/UI/FormGroup'
import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'

export default async function TankVisual({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: inspectionID } = await params

	let vis = await Visual.findByPk(inspectionID, { include: Cylinder })

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>
						Vis Results - {vis?.Cylinder?.serialNumber} (
						{vis?.date.toISOString()}) #{vis?.id}
					</h1>
				</div>

				<FormGroup title='Cylinder Info' description=''>
					<>
						Material: {vis?.Cylinder?.material}
						<br />
						First Hydro: {vis?.Cylinder?.birth.toString()}
						<br />
						Last Hydro: {vis?.Cylinder?.lastHydro.toString()}
						<br />
						Valve type: {vis?.valve}
					</>
				</FormGroup>

				<FormGroup title='External' description=''>
					<>
						Evidence of Heat Damage: {vis?.heat ? 'Yes' : 'No'}
						<br />
						Evidence of Re-painting: {vis?.painted ? 'Yes' : 'No'}
						<br />
						Evidence of odor: {vis?.odor ? 'Yes' : 'No'}
						<br />
						Evidence of Bow: {vis?.bow ? 'Yes' : 'No'}
						<br />
						Hammer tone test - bell like sound: {vis?.bell ? 'Yes' : 'No'}
						<br />
						Line corrosion around boot and other accessories:{' '}
						{vis?.lineCorrosion ? 'Yes' : 'No'}
						<br />
						Notes: {vis?.exteriorDescription} {vis?.exteriorMarks}
						<br />
						Result: {vis?.externalStandards}
					</>
				</FormGroup>

				<FormGroup title='Internal' description=''>
					<>
						Amount and composition of contents: {vis?.internalContents}
						<br />
						Notes on internal surface: {vis?.internalDescription}
						<br />
						Notes: {vis?.internalMarks}
						<br />
						Result: {vis?.internalStandards}
					</>
				</FormGroup>

				<FormGroup title='Threading' description=''>
					<>
						Notes on Threads: {vis?.threadingDescription}
						<br />
						Number of damaged threads: {vis?.badThreadCount}
						<br />
						Result: {vis?.threadingStandards}
					</>
				</FormGroup>

				<FormGroup title='Valve' description=''>
					<>
						Burst disk replaced: {vis?.burstDiskReplaced ? 'Yes' : 'No'}
						<br />
						oring replaced: {vis?.oringReplaced ? 'Yes' : 'No'}
						<br />
						had dip tube: {vis?.dipTube ? 'Yes' : 'No'}
						<br />
						Service needed: {vis?.needService ? 'Yes' : 'No'}
						<br />
						rebuilt: {vis?.rebuilt ? 'Yes' : 'No'}
						<br />
						Result: {vis?.threadingStandards}
					</>
				</FormGroup>

				<FormGroup title='Final' description=''>
					<>
						O2 cleaned: {vis?.oxygenCleaned ? 'Yes' : 'No'}
						<br />
						is O2 Clean: {vis?.markedOxygenClean ? 'Yes' : 'No'}
						<br />
						Date: {vis?.date.toISOString()}
						<br />
						Result: {vis?.status}
					</>
				</FormGroup>
			</div>
		</div>
	)
}

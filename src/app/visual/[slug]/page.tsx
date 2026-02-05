'use server'

import FormGroup from '@/components/UI/FormGroup'
import PropertyRow from '@/components/VisHistory/PropertyRow'
import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'
import dayjs from 'dayjs'

export default async function TankVisual({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: inspectionID } = await params

	let vis = await Visual.findByPk(inspectionID, { include: Cylinder })

	if (!vis) {
		return <h1>Loading...</h1>
	}

	const getBadge = () => {
		switch (vis.status) {
			case 'acceptable':
				return <CheckCircleIcon className='w-10 text-green-500' />
			case 'marginal':
				return <ExclamationTriangleIcon className='w-10 text-yellow-500' />
			case 'fail':
				return <ExclamationCircleIcon className='w-10 text-red-500' />
			default:
				return <></>
		}
	}

	return (
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl'>
						<span className='flex items-center justify-center gap-2'>
							{getBadge()}
							<span>{`Vis Results - ${vis.Cylinder?.serialNumber}`}</span>
						</span>
					</h1>
					<div className='flex flex-col items-center justify-center gap-1'>
						<p className='mt-2 text-lg/8 text-gray-600'>
							Date of Inspection: {dayjs(vis.date).format('DD/MM/YYYY')} #
							{vis.id}
						</p>
						<p className='text-lg/8 text-gray-600'>
							Inspected by: {vis.inspectorId}
						</p>
					</div>
				</div>

				<FormGroup title='Cylinder Info' description=''>
					<div className='flex flex-col gap-2'>
						<PropertyRow title='Material' text={vis.Cylinder?.material} />
						<PropertyRow
							title='First Hydro'
							text={dayjs(vis.Cylinder?.birth).format('MM/YYYY')}
						/>
						<PropertyRow
							title='Last Hydro'
							text={dayjs(vis.Cylinder?.lastHydro).format('MM/YYYY')}
						/>
						<PropertyRow title='Valve Type' text={vis.valve} />
					</div>
				</FormGroup>

				<FormGroup
					title='External'
					description=''
					badge={vis.externalStandards}
				>
					<div className='flex flex-col gap-2'>
						<PropertyRow
							title='Evidence of Heat Damage'
							text={vis.heat ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Evidence of Re-painting'
							text={vis.painted ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Evidence of odor'
							text={vis.odor ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Evidence of bow'
							text={vis.bow ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Hammer tone test - bell like sound'
							text={vis.bell ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Line corrosion around boot and other accessories'
							text={vis.lineCorrosion ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Notes'
							text={`${vis.exteriorDescription} ${vis.exteriorMarks}`}
						/>
						<PropertyRow title='Results' text={vis.externalStandards} />
					</div>
				</FormGroup>

				<FormGroup
					title='Internal'
					description=''
					badge={vis.threadingStandards}
				>
					<div className='flex flex-col gap-2'>
						<PropertyRow
							title='Amount and composition of contents'
							text={vis.internalContents}
						/>
						<PropertyRow
							title='Notes on internal surface'
							text={vis.internalDescription}
						/>
						<PropertyRow title='Notes' text={vis.internalMarks} />
						<PropertyRow title='Result' text={vis.internalStandards} />
					</div>
				</FormGroup>

				<FormGroup
					title='Threading'
					description=''
					badge={vis.threadingStandards}
				>
					<div className='flex flex-col gap-2'>
						<PropertyRow
							title='Notes on Threads'
							text={vis.threadingDescription}
						/>
						<PropertyRow
							title='Number of damaged threads'
							text={vis.badThreadCount.toString()}
						/>
						<PropertyRow title='Result' text={vis.threadingStandards} />
					</div>
				</FormGroup>

				<FormGroup title='Valve' description='' badge={vis.threadingStandards}>
					<div className='flex flex-col gap-2'>
						<PropertyRow
							title='Burst disk replaced'
							text={vis.burstDiskReplaced ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='O-Ring replaced'
							text={vis.oringReplaced ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Had dip tube'
							text={vis.dipTube ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Service needed'
							text={vis.needService ? 'Yes' : 'No'}
						/>
						<PropertyRow title='Rebuilt' text={vis.rebuilt ? 'Yes' : 'No'} />
						<PropertyRow title='Result' text={vis.threadingStandards} />
					</div>
				</FormGroup>

				<FormGroup title='Final' description='' badge={vis.status}>
					<div className='flex flex-col gap-2'>
						<PropertyRow
							title='O2 cleaned'
							text={vis.oxygenCleaned ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Is O2 clean'
							text={vis.markedOxygenClean ? 'Yes' : 'No'}
						/>
						<PropertyRow
							title='Date'
							text={dayjs(vis.date).format('DD/MM/YYYY HH:MM')}
						/>
						<PropertyRow title='Result' text={vis.status} />
					</div>
				</FormGroup>
			</div>
		</div>
	)
}

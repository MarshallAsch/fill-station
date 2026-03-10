'use client'

import { Suspense } from 'react'
import MaintenanceHistory from '@/components/History/MaintenanceHistory/MaintenanceHistory'
import HistoryTable from '@/components/History/components/HistoryTable'
import VisHistory from '@/components/History/VisHistory'
import ClientList from '@/components/History/ClientList'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import useLoadCylinder from '@/hooks/useLoadCylinders'
import { useSearchParams } from 'next/navigation'
import { TAB } from './layout'

const HistoryContent = () => {
	const params = useSearchParams()

	const { cylinders } = useLoadCylinder()

	const getTabComponent = () => {
		switch (params.get('tab')) {
			case TAB.FILLS:
				return <HistoryTable />
			case TAB.VIS_INSPECTION:
				return <VisHistory />
			case TAB.COMP_MAINTENANCE:
				return <MaintenanceHistory />
			case TAB.CLIENTS:
				return <ClientList />
			case TAB.CYLINDERS:
				return <CylinderListTable cylinders={cylinders} showOwner />
			default:
				return <HistoryTable />
		}
	}

	return (
		<div className='container flex w-full flex-wrap justify-center'>
			{getTabComponent()}
		</div>
	)
}

export default function History() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<HistoryContent />
		</Suspense>
	)
}

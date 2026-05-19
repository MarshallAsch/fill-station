'use client'

import { Suspense } from 'react'
import MaintenanceHistory from '@/components/History/MaintenanceHistory/MaintenanceHistory'
import VisHistory from '@/components/History/VisHistory'
import ClientList from '@/components/History/ClientList'
import CylindersTab from '@/components/History/CylindersTab'
import FillsTab from '@/components/History/FillsTab'
import useLoadCylinder from '@/hooks/useLoadCylinders'
import { useSearchParams } from 'next/navigation'
import { TAB } from './layout'

const HistoryContent = () => {
	const params = useSearchParams()

	const { cylinders } = useLoadCylinder()

	const getTabComponent = () => {
		switch (params.get('tab')) {
			case TAB.FILLS:
				return <FillsTab />
			case TAB.VIS_INSPECTION:
				return <VisHistory />
			case TAB.COMP_MAINTENANCE:
				return <MaintenanceHistory />
			case TAB.CLIENTS:
				return <ClientList />
			case TAB.CYLINDERS:
				return <CylindersTab cylinders={cylinders} />
			default:
				return <FillsTab />
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

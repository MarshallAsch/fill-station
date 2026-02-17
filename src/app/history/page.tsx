'use client'

import React from 'react'
import { useAppSelector } from '@/redux/hooks'
import { TAB } from '@/redux/history/historySlice'
import MaintenanceHistory from '@/components/History/MaintenanceHistory/MaintenanceHistory'
import HistoryTable from '@/components/History/components/HistoryTable'
import VisHistory from '@/components/History/VisHistory'
import ClientList from '@/components/History/ClientList'
import CylinderList from '@/components/History/CylinderList'
import { useSession } from 'next-auth/react'

export default function History() {
	const { selectedTab } = useAppSelector((state) => state.history)

	const session = useSession()
	if (session.status !== 'authenticated') {
		return <div>Not Authorized</div>
	}

	const getTabComponent = () => {
		switch (selectedTab) {
			case TAB.FILLS:
				return <HistoryTable />
			case TAB.VIS_INSPECTION:
				return <VisHistory />
			case TAB.COMP_MAINTENANCE:
				return <MaintenanceHistory />
			case TAB.CLIENTS:
				return <ClientList />
			case TAB.CYLINDERS:
				return <CylinderList />
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

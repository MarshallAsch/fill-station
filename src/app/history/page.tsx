'use client'

import React from 'react'
import { useAppSelector } from '@/redux/hooks'
import { TAB } from '@/redux/history/historySlice'
import FillsHistory from '@/components/History/FillsHistory'
import MaintenanceHistory from '@/components/History/MaintenanceHistory/MaintenanceHistory'
import HistoryTable from '@/components/History/components/HistoryTable'
import VisHistory from '@/components/History/VisHistory'
import ClientList from '@/components/History/ClientList'

export default function History() {
	const { selectedTab } = useAppSelector((state) => state.history)

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
			default:
				return <FillsHistory />
		}
	}

	return (
		<div className='container flex w-full flex-wrap justify-center'>
			{getTabComponent()}
		</div>
	)
}

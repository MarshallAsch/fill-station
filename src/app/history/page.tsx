'use client'

import React from 'react'
import { useAppSelector } from '@/redux/hooks'
import { TAB } from '@/redux/history/historySlice'
import FillsHistory from '@/components/History/FillsHistory'
import VisHistory from '@/components/History/VisHistory'
import MaintenanceHistory from '@/components/History/MaintenanceHistory'

export default function History() {
	const { selectedTab } = useAppSelector((state) => state.history)

	const getTabComponent = () => {
		switch (selectedTab) {
			case TAB.FILLS:
				return <FillsHistory />
			case TAB.VIS_INSPECTION:
				return <VisHistory />
			case TAB.COMP_MAINTENANCE:
				return <MaintenanceHistory />
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

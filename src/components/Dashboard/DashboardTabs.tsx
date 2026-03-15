'use client'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Cylinder } from '@/types/cylinder'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FillHistoryTable from '@/components/History/components/FillHistoryTable'
import VisHistoryTable from '@/components/History/components/VisHistoryTable'

type DashboardTabsProps = {
	cylinders: Cylinder[]
}

const tabs = [
	{ name: 'Cylinders' },
	{ name: 'Recent Fills' },
	{ name: 'Visual Inspections' },
]

const DashboardTabs = ({ cylinders }: DashboardTabsProps) => {
	return (
		<TabGroup className='w-full'>
			<TabList className='border-border grid grid-cols-3 border-b'>
				{tabs.map((tab) => (
					<Tab
						key={tab.name}
						className='text-light-text hover:text-text data-selected:text-accent-text data-selected:border-accent cursor-pointer border-b-2 border-transparent py-2.5 text-center text-sm font-semibold transition outline-none'
					>
						{tab.name}
					</Tab>
				))}
			</TabList>
			<TabPanels className='mt-4'>
				<TabPanel>
					<CylinderListTable cylinders={cylinders} />
				</TabPanel>
				<TabPanel>
					<FillHistoryTable />
				</TabPanel>
				<TabPanel>
					<VisHistoryTable />
				</TabPanel>
			</TabPanels>
		</TabGroup>
	)
}

export default DashboardTabs

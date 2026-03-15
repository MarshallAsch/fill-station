'use server'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Cylinder } from '@/types/cylinder'
import { FillHistory } from '@/types/fills'
import { VisualHistory } from '@/types/visuals'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import FillHistoryTable from '@/components/History/components/FillHistoryTable'
import VisHistoryTable from '@/components/History/components/VisHistoryTable'

type DashboardTabsProps = {
	cylinders: Cylinder[]
	fills: FillHistory[]
	visuals: VisualHistory[]
	hideVisDetails?: boolean
}

const tabs = [
	{ name: 'My Cylinders' },
	{ name: 'My Fills' },
	{ name: 'Past Visual Inspections' },
]

const DashboardTabs = async ({
	cylinders,
	fills,
	visuals,
	hideVisDetails = false,
}: DashboardTabsProps) => {
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
					<CylinderListTable cylinders={cylinders} hideInspection />
				</TabPanel>
				<TabPanel>
					<FillHistoryTable fills={fills} />
				</TabPanel>
				<TabPanel>
					<VisHistoryTable visuals={visuals} hideDetails={hideVisDetails} />
				</TabPanel>
			</TabPanels>
		</TabGroup>
	)
}

export default DashboardTabs

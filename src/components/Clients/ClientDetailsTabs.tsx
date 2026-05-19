'use client'

import clsx from 'clsx'
import Link from 'next/link'

export type ClientDetailsTab = 'cylinders' | 'fills'

const tabs: Array<{ value: ClientDetailsTab; label: string }> = [
	{ value: 'cylinders', label: 'Cylinders' },
	{ value: 'fills', label: 'Fills' },
]

type ClientDetailsTabsProps = {
	clientId: string
	activeTab: ClientDetailsTab
}

const ClientDetailsTabs = ({ clientId, activeTab }: ClientDetailsTabsProps) => {
	return (
		<div className='border-border flex border-b'>
			{tabs.map((tab) => (
				<Link
					key={tab.value}
					href={`/clients/${clientId}?tab=${tab.value}`}
					replace
					scroll={false}
					className={clsx(
						'px-4 py-2 text-sm font-semibold transition',
						tab.value === activeTab
							? 'border-accent text-accent-text -mb-px border-b-2'
							: 'text-light-text hover:text-text',
					)}
				>
					{tab.label}
				</Link>
			))}
		</div>
	)
}

export default ClientDetailsTabs

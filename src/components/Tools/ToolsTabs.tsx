'use client'

import { useState } from 'react'
import { GROUPS, TOOLS, TabId, ToolGroup } from './toolsRegistry'
import SettingsModal from './SettingsModal'

const ToolsTabs = ({
	active,
	onChange,
}: {
	active: TabId
	onChange: (id: TabId) => void
}) => {
	const [settingsOpen, setSettingsOpen] = useState(false)
	const activeTool = TOOLS.find((t) => t.id === active) ?? TOOLS[0]
	const activeGroup: ToolGroup = activeTool.group
	const groupTabs = TOOLS.filter((t) => t.group === activeGroup)

	const selectGroup = (group: ToolGroup) => {
		const first = TOOLS.find((t) => t.group === group)
		if (first) onChange(first.id)
	}

	return (
		<div className='space-y-3'>
			<SettingsModal
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
			<div className='flex items-center justify-between gap-2'>
				<div className='border-border inline-flex overflow-hidden rounded-md border'>
					{GROUPS.map((g) => {
						const isActive = g.id === activeGroup
						return (
							<button
								key={g.id}
								type='button'
								onClick={() => selectGroup(g.id)}
								className={
									isActive
										? 'bg-accent text-white-text px-4 py-1.5 text-sm font-semibold'
										: 'text-text hover:bg-hover px-4 py-1.5 text-sm font-medium'
								}
							>
								{g.name}
							</button>
						)
					})}
				</div>
				<button
					type='button'
					onClick={() => setSettingsOpen(true)}
					className='border-border text-text hover:bg-hover rounded-md border px-3 py-1.5 text-sm font-medium'
				>
					⚙ Settings
				</button>
			</div>
			<div className='border-border flex flex-wrap gap-2 border-b'>
				{groupTabs.map((tab) => {
					const isActive = tab.id === active
					return (
						<button
							key={tab.id}
							type='button'
							onClick={() => onChange(tab.id)}
							className={
								isActive
									? 'border-accent text-text -mb-px border-b-2 px-4 py-2 text-sm font-semibold'
									: 'text-light-text hover:text-text -mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium'
							}
						>
							{tab.name}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default ToolsTabs

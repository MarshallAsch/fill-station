'use client'

export type TabId = 'cascade' | 'nitrox-stick' | 'blend' | 'mod-end'

export const TABS: { id: TabId; name: string }[] = [
	{ id: 'cascade', name: 'Cascade Fill' },
	{ id: 'nitrox-stick', name: 'Nitrox Stick' },
	{ id: 'blend', name: 'Blend (PP)' },
	{ id: 'mod-end', name: 'MOD / END' },
]

const ToolsTabs = ({
	active,
	onChange,
}: {
	active: TabId
	onChange: (id: TabId) => void
}) => {
	return (
		<div className='border-border flex flex-wrap gap-2 border-b'>
			{TABS.map((tab) => {
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
	)
}

export default ToolsTabs

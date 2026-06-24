'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import BlendCalculator from './BlendCalculator'
import CascadeCalculator from './CascadeCalculator'
import NitroxStickCalculator from './NitroxStickCalculator'
import UnitsProvider from './UnitsProvider'
import ToolsTabs, { TABS, TabId } from './ToolsTabs'

function isTabId(value: string | null): value is TabId {
	return TABS.some((t) => t.id === value)
}

const ToolsPage = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const param = searchParams.get('tab')
	const active: TabId = isTabId(param) ? param : 'cascade'

	const onChange = (id: TabId) => {
		router.replace(`/tools?tab=${id}`)
	}

	return (
		<UnitsProvider>
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<h1 className='text-text mb-2 text-3xl font-bold'>Dive Tools</h1>
				<p className='text-light-text mb-6 text-sm'>
					Gas blending and dive-planning calculators. Estimates only — always
					verify with an analyzer.
				</p>
				<ToolsTabs active={active} onChange={onChange} />
				<div className='mt-6'>
					{active === 'cascade' && <CascadeCalculator />}
					{active === 'nitrox-stick' && <NitroxStickCalculator />}
					{active === 'blend' && <BlendCalculator />}
					{active === 'mod-end' && <p className='text-text'>MOD / END</p>}
				</div>
			</div>
		</UnitsProvider>
	)
}

export default ToolsPage

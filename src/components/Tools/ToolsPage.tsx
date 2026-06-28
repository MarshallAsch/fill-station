'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import UnitsProvider from './UnitsProvider'
import ToolsTabs from './ToolsTabs'
import { TOOLS, TabId } from './toolsRegistry'

function isTabId(value: string | null): value is TabId {
	return TOOLS.some((t) => t.id === value)
}

const ToolsPage = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const param = searchParams.get('tab')
	const active: TabId = isTabId(param) ? param : 'cascade'
	const ActiveComponent = (TOOLS.find((t) => t.id === active) ?? TOOLS[0])
		.Component

	const onChange = (id: TabId) => {
		router.replace(`/tools?tab=${id}`)
	}

	return (
		<UnitsProvider>
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<h1 className='text-text mb-2 text-3xl font-bold'>Dive Tools</h1>
				<Link
					href='/tools/about'
					className='text-accent mb-4 inline-block text-sm underline'
				>
					About these tools &amp; how they work →
				</Link>
				<div className='border-border bg-hover text-text mb-6 rounded-md border p-3 text-sm'>
					<span className='font-semibold'>For reference only.</span> All results
					are estimates — independently verify and analyze every gas mix and
					dive plan before diving.
				</div>
				<ToolsTabs active={active} onChange={onChange} />
				<div className='mt-6'>
					<ActiveComponent />
				</div>
			</div>
		</UnitsProvider>
	)
}

export default ToolsPage

import Link from 'next/link'
import ReferenceFundamentals from '@/components/Tools/reference/ReferenceFundamentals'

export default function ToolsReferencePage() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Link href='/tools' className='text-accent text-sm underline'>
				← Back to tools
			</Link>
			<h1 className='text-text mt-4 mb-2 text-3xl font-bold'>
				The math behind the tools
			</h1>
			<div className='border-border bg-hover text-text mb-4 rounded-md border p-3 text-sm'>
				<span className='font-semibold'>For reference only.</span> All results
				are estimates — independently verify and analyze every gas mix and dive
				plan before diving.
			</div>
			<p className='text-light-text mb-6 text-sm'>
				The equations, constants, and references behind each calculator, so you
				can check the math. See also the{' '}
				<Link href='/tools/about' className='text-accent underline'>
					tool overview
				</Link>
				.
			</p>

			<ReferenceFundamentals />
		</div>
	)
}

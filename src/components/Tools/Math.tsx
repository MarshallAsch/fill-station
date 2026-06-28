import { ReactNode } from 'react'

// A stacked fraction with a horizontal bar — lightweight CSS, no dependency.
export const Frac = ({ num, den }: { num: ReactNode; den: ReactNode }) => (
	<span className='mx-1 inline-flex flex-col text-center align-middle leading-tight'>
		<span className='border-text border-b px-1'>{num}</span>
		<span className='px-1'>{den}</span>
	</span>
)

// Inline math container — slightly larger, non-mono, with comfortable spacing
// so the fraction bars and operators read like an equation rather than code.
export const MathExpr = ({ children }: { children: ReactNode }) => (
	<span className='text-text inline-flex flex-wrap items-center gap-x-1 text-sm leading-loose'>
		{children}
	</span>
)

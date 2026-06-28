import { ReactNode } from 'react'

// A monospace equation block. Scrolls horizontally inside its own container so
// the page body never scrolls; preserves whitespace/newlines for multi-line math.
const Formula = ({ children }: { children: ReactNode }) => (
	<pre className='border-border bg-hover text-text my-2 overflow-x-auto rounded-md border p-3 font-mono text-sm whitespace-pre'>
		{children}
	</pre>
)

export default Formula

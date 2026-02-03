import Link from 'next/link'

export default function About() {
	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center'>
				<h1 className='mb-2 text-4xl'>
					Material UI - Next.js example in TypeScript
				</h1>
				<div className='max-w-xs'>
					<Link href='/' className='text-blue-500 underline'>
						Go to the home page
					</Link>
				</div>
			</div>
		</div>
	)
}

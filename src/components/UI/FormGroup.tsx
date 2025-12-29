import { JSX } from 'react'

type Props = {
	title: string
	description: string
	children: JSX.Element
}

const FormGroup = ({ title, description, children }: Props) => {
	return (
		<div className='grid grid-cols-1 border-b border-gray-900/10 py-6 md:grid-cols-3'>
			<div>
				<h2 className='text-base/7 font-semibold text-gray-900'>{title}</h2>
				<p className='mt-1 text-sm/6 text-gray-600'>{description}</p>
			</div>

			<div className='grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2'>
				<div className='sm:col-span-full'>
					<div className='flex w-full flex-col gap-3'>{children}</div>
				</div>
			</div>
		</div>
	)
}

export default FormGroup

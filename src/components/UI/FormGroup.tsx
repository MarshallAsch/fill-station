import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { JSX } from 'react'

type Props = {
	title: string
	description: string
	children: JSX.Element
	badge?: 'acceptable' | 'marginal' | 'fail'
}

const FormGroup = ({ title, description, children, badge }: Props) => {
	const getBadge = () => {
		switch (badge) {
			case 'acceptable':
				return <CheckCircleIcon className='w-10 text-green-500' />
			case 'marginal':
				return <ExclamationTriangleIcon className='w-10 text-yellow-500' />
			case 'fail':
				return <ExclamationCircleIcon className='w-10 text-red-500' />
			default:
				return <></>
		}
	}
	return (
		<div className='grid grid-cols-1 border-b border-gray-900/10 py-6 md:grid-cols-3'>
			<div>
				<h2 className='text-base/7 font-semibold text-gray-900'>{title}</h2>
				<p className='mt-1 text-sm/6 text-gray-600'>{description}</p>
				{badge && getBadge()}
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

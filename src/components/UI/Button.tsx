import { Button as HeadlessButton } from '@headlessui/react'
import clsx from 'clsx'
import { ReactNode, ComponentPropsWithoutRef } from 'react'

type ButtonProps = {
	children: ReactNode
	variant?: 'standard' | 'ghost'
} & ComponentPropsWithoutRef<typeof HeadlessButton>

const Button = ({ children, variant = 'standard', ...props }: ButtonProps) => {
	const getStyling = () => {
		switch (variant) {
			case 'ghost':
				return 'mt-3 inline-flex w-full cursor-pointer justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0'
			case 'standard':
			default:
				return 'inline-flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2'
		}
	}
	return (
		<HeadlessButton
			{...props}
			className={clsx(
				getStyling(),
				'disabled:cursor-not-allowed disabled:bg-gray-300',
			)}
		>
			{children}
		</HeadlessButton>
	)
}

export default Button

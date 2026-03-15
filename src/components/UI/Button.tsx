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
				return 'mt-3 inline-flex w-full cursor-pointer justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-text shadow-xs inset-ring-1 inset-ring-ring hover:bg-hover sm:col-start-1 sm:mt-0'
			case 'standard':
			default:
				return 'inline-flex w-full cursor-pointer justify-center rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-start-2'
		}
	}
	return (
		<HeadlessButton
			{...props}
			className={clsx(
				getStyling(),
				'disabled:bg-disabled disabled:cursor-not-allowed',
			)}
		>
			{children}
		</HeadlessButton>
	)
}

export default Button

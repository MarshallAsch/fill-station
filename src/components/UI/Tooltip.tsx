import clsx from 'clsx'
import { ReactNode } from 'react'

type TooltipPosition = 'above' | 'below' | 'left' | 'right'

const positionClasses: Record<TooltipPosition, string> = {
	above: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
	below: 'top-full left-1/2 mt-2 -translate-x-1/2',
	left: 'right-full top-1/2 mr-2 -translate-y-1/2',
	right: 'left-full top-1/2 ml-2 -translate-y-1/2',
}

type TooltipProps = {
	children: ReactNode
	message: string
	position?: TooltipPosition
}

const Tooltip = ({ children, message, position = 'above' }: TooltipProps) => {
	return (
		<div className='group relative flex w-max items-center'>
			{children}
			<span
				className={clsx(
					'invisible absolute z-50 rounded bg-black px-3 py-1 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100',
					positionClasses[position],
				)}
			>
				{message}
			</span>
		</div>
	)
}

export default Tooltip

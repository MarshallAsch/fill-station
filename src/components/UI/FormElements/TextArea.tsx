import { InputHTMLAttributes } from 'react'

type InputProps = {
	id: string
	name: string
	placeholder: string
	ariaLabel: string
	description?: string
} & InputHTMLAttributes<HTMLTextAreaElement>

const TextArea = ({
	id,
	name,
	placeholder,
	ariaLabel,
	description,
	...props
}: InputProps) => {
	return (
		<div className='flex w-full flex-col gap-0'>
			<textarea
				id={id}
				name={name}
				placeholder={placeholder}
				aria-label={ariaLabel}
				className='bg-background block w-full rounded-md px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-gray-800 dark:text-gray-100 dark:outline-gray-600 dark:placeholder:text-gray-500'
				{...props}
			/>
			{description && (
				<p className='text-xs text-gray-600 dark:text-gray-400'>
					{description}
				</p>
			)}
		</div>
	)
}

export default TextArea

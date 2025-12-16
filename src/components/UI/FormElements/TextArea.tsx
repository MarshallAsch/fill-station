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
				className='block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
				{...props}
			/>
			{description && <p className='text-xs text-gray-600'>{description}</p>}
		</div>
	)
}

export default TextArea

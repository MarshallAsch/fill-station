import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'

type InputProps = {
	id: string
	name: string
	type: HTMLInputTypeAttribute
	placeholder: string
	ariaLabel: string
	description?: string
} & InputHTMLAttributes<HTMLInputElement>

const TextInput = ({
	id,
	name,
	type,
	placeholder,
	ariaLabel,
	description,
	...props
}: InputProps) => {
	return (
		<div className='flex w-full flex-col gap-0'>
			<input
				{...props}
				id={id}
				name={name}
				type={type}
				placeholder={placeholder}
				aria-label={ariaLabel}
				className='bg-background text-text outline-ring placeholder:text-muted-text focus:outline-accent block w-full rounded-md px-3 py-1.5 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6'
			/>
			{description && <p className='text-light-text text-xs'>{description}</p>}
		</div>
	)
}

export default TextInput

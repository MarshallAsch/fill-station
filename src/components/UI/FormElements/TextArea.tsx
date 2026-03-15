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
				className='bg-background text-text outline-ring placeholder:text-muted-text focus:outline-accent block w-full rounded-md px-3 py-1.5 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6'
				{...props}
			/>
			{description && <p className='text-light-text text-xs'>{description}</p>}
		</div>
	)
}

export default TextArea

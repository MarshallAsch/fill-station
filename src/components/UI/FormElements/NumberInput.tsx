type NumberInputProps = {
	id: string
	name: string
	label?: string
	value: number
	onChange: (value: number) => void
	placeholder?: string
	disabled?: boolean
}

const NumberInput = ({
	id,
	name,
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
}: NumberInputProps) => {
	return (
		<div className='w-full'>
			{label && (
				<label
					htmlFor={id}
					className='text-text mb-1 block text-sm font-medium'
				>
					{label}
				</label>
			)}

			<input
				id={id}
				name={name}
				type='number'
				value={value}
				disabled={disabled}
				placeholder={placeholder}
				onChange={(e) =>
					onChange(e.target.value === '' ? 0 : Number(e.target.value))
				}
				className='bg-background border-border text-text disabled:bg-disabled focus:border-accent focus:ring-accent block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60'
			/>
		</div>
	)
}

export default NumberInput

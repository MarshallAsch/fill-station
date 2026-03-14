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
					className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
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
				className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700'
			/>
		</div>
	)
}

export default NumberInput

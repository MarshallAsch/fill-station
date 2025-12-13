type NumberInputProps = {
	id: string
	name: string
	label?: string
	value: number
	onChange: (value: number) => void
	placeholder?: string
}

const NumberInput = ({
	id,
	name,
	label,
	value,
	onChange,
	placeholder,
}: NumberInputProps) => {
	return (
		<div className='w-full'>
			{label && (
				<label
					htmlFor={id}
					className='mb-1 block text-sm font-medium text-gray-700'
				>
					{label}
				</label>
			)}

			<input
				id={id}
				name={name}
				type='number'
				value={value}
				placeholder={placeholder}
				onChange={(e) =>
					onChange(e.target.value === '' ? 0 : Number(e.target.value))
				}
				className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60'
			/>
		</div>
	)
}

export default NumberInput

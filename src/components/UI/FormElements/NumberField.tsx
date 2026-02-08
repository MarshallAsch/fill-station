type Props = {
	id: string
	helperText: string
	name: string
	min?: number
	max?: number
	defaultValue?: number
}

const NumberField = ({
	id,
	helperText,
	name,
	min,
	max,
	defaultValue,
}: Props) => {
	return (
		<>
			{helperText && <p className='text-gray-500'>{helperText}</p>}
			<input
				type='number'
				id={id}
				name={name}
				defaultValue={defaultValue}
				min={min}
				max={max}
				className='rounded border border-gray-300 p-2'
			/>
		</>
	)
}

export default NumberField

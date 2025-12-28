type Props = {
	id: string
	helperText: string
	name: string
	min?: number
	max?: number
}

const NumberField = ({ id, helperText, name, min, max }: Props) => {
	return (
		<>
			{helperText && <p className='text-gray-500'>{helperText}</p>}
			<input
				type='number'
				id={id}
				name={name}
				min={min}
				max={max}
				className='rounded border border-gray-300 p-2'
			/>
		</>
	)
}

export default NumberField

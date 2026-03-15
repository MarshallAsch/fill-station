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
			{helperText && <p className='text-light-text'>{helperText}</p>}
			<input
				type='number'
				id={id}
				name={name}
				defaultValue={defaultValue}
				min={min}
				max={max}
				className='bg-background border-border text-text rounded border p-2'
			/>
		</>
	)
}

export default NumberField

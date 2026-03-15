type RadioGroupProps = {
	title: string
	options: {
		value: string | number
		label: string
	}[]
	defaultValue?: string | number
	value?: string | number
	readOnly?: boolean
	name: string
	description?: string
	required?: boolean
	onChange?: (value: string) => void
}

const RadioGroup = ({
	title,
	options,
	name,
	description,
	value,
	defaultValue,
	readOnly,
	onChange,
}: RadioGroupProps) => {
	return (
		<fieldset className='w-full'>
			<div className='flex items-center justify-between'>
				<div className='text-text text-sm/6 font-medium'>{title}</div>
			</div>
			<div className='mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4'>
				{options.map((option) => (
					<label
						key={option.value}
						aria-label={option.label}
						className='group bg-background border-border has-checked:border-accent has-checked:bg-accent has-focus-visible:outline-accent has-disabled:border-disabled has-disabled:bg-disabled relative flex items-center justify-center rounded-md border p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-disabled:opacity-25'
					>
						<input
							name={name}
							type='radio'
							value={option.value}
							checked={value === undefined ? undefined : value == option.value}
							readOnly={readOnly}
							onChange={() => onChange?.(String(option.value))}
							defaultChecked={
								value
									? undefined
									: option.value === (defaultValue ?? options[0].value)
							}
							className='absolute inset-0 cursor-pointer appearance-none focus:outline-none disabled:cursor-not-allowed'
						/>
						<span className='text-text text-sm font-medium group-has-checked:text-white'>
							{option.label}
						</span>
					</label>
				))}
			</div>
			{description && <p className='text-light-text text-xs'>{description}</p>}
		</fieldset>
	)
}
export default RadioGroup

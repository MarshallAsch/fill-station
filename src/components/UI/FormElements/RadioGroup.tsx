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
}

const RadioGroup = ({
	title,
	options,
	name,
	description,
	value,
	defaultValue,
	readOnly,
}: RadioGroupProps) => {
	return (
		<fieldset className='w-full'>
			<div className='flex items-center justify-between'>
				<div className='text-sm/6 font-medium text-gray-900'>{title}</div>
			</div>
			<div className='mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4'>
				{options.map((option) => (
					<label
						key={option.value}
						aria-label={option.label}
						className='group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-checked:border-indigo-600 has-checked:bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25'
					>
						<input
							name={name}
							type='radio'
							value={option.value}
							checked={value === undefined ? undefined : value == option.value}
							readOnly={readOnly}
							defaultChecked={
								value
									? undefined
									: option.value === (defaultValue ?? options[0].value)
							}
							className='absolute inset-0 cursor-pointer appearance-none focus:outline-none disabled:cursor-not-allowed'
						/>
						<span className='text-sm font-medium text-gray-900 group-has-checked:text-white'>
							{option.label}
						</span>
					</label>
				))}
			</div>
			{description && <p className='text-xs text-gray-600'>{description}</p>}
		</fieldset>
	)
}
export default RadioGroup

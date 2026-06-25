import Tooltip from '@/components/UI/Tooltip'

type NumberInputProps = {
	id: string
	name: string
	label?: string
	value: number
	onChange: (value: number) => void
	placeholder?: string
	disabled?: boolean
	tooltip?: string
	min?: number
	max?: number
	step?: number
}

const NumberInput = ({
	id,
	name,
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
	tooltip,
	min,
	max,
	step,
}: NumberInputProps) => {
	return (
		<div className='w-full'>
			{label && (
				<label
					htmlFor={id}
					className='text-text mb-1 flex items-center text-sm font-medium'
				>
					{label}
					{tooltip && (
						<Tooltip message={tooltip}>
							<span className='text-light-text ml-1 cursor-help'>ⓘ</span>
						</Tooltip>
					)}
				</label>
			)}

			<input
				id={id}
				name={name}
				type='number'
				value={String(Number(value))}
				disabled={disabled}
				placeholder={placeholder}
				min={min}
				max={max}
				step={step}
				onChange={(e) =>
					onChange(e.target.value === '' ? 0 : Number(e.target.value))
				}
				className='bg-background border-border text-text disabled:bg-disabled focus:border-accent focus:ring-accent block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60'
			/>
		</div>
	)
}

export default NumberInput

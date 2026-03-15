type CheckBoxProps = {
	title: string
	description?: string
	defaultChecked?: boolean
	id: string
	name: string
}

const Checkbox = ({
	title,
	description,
	defaultChecked = false,
	id,
	name,
}: CheckBoxProps) => {
	return (
		<div className='flex gap-3'>
			<div className='flex h-6 shrink-0 items-center'>
				<div className='group grid size-4 grid-cols-1'>
					<input
						defaultChecked={defaultChecked}
						id={id}
						name={name}
						type='checkbox'
						aria-describedby='comments-description'
						className='bg-background border-border checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent focus-visible:outline-accent disabled:border-border disabled:bg-disabled disabled:checked:bg-disabled col-start-1 row-start-1 appearance-none rounded-sm border focus-visible:outline-2 focus-visible:outline-offset-2 forced-colors:appearance-auto'
					/>
					<svg
						fill='none'
						viewBox='0 0 14 14'
						className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25'
					>
						<path
							d='M3 8L6 11L11 3.5'
							strokeWidth={2}
							strokeLinecap='round'
							strokeLinejoin='round'
							className='opacity-0 group-has-checked:opacity-100'
						/>
						<path
							d='M3 7H11'
							strokeWidth={2}
							strokeLinecap='round'
							strokeLinejoin='round'
							className='opacity-0 group-has-indeterminate:opacity-100'
						/>
					</svg>
				</div>
			</div>
			<div className='text-sm/6'>
				<label htmlFor={id} className='text-text font-medium'>
					{title}
				</label>
				<p id='comments-description' className='text-light-text'>
					{description}
				</p>
			</div>
		</div>
	)
}

export default Checkbox

type PropertyRowProp = {
	title: string
	text: string | undefined
}

const PropertyRow = ({ title, text }: PropertyRowProp) => {
	return (
		<div className='flex w-full items-center justify-between gap-2 hover:font-bold'>
			<span className='text-muted-foreground text-left'>{title}</span>
			<span className='grow border-b'></span>
			<span className='bg-muted rounded-full px-3 py-1 text-sm capitalize'>
				{text}
			</span>
		</div>
	)
}

export default PropertyRow

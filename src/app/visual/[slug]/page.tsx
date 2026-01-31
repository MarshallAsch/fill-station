'use server'

export default async function TankVisual({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug: inspectionID } = await params

	return (
		<div className='max-w-7xl'>
			<h2 className='text-3xl'>Visual Inspection - {inspectionID}</h2>
		</div>
	)
}

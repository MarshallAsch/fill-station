'use server'

import * as React from 'react'
import Typography from '@mui/material/Typography'

export default async function TankVisual({ params }) {
	const { slug: inspectionID } = await params

	return (
		<div className='max-w-7xl'>
			<Typography variant='h2' component='h2' sx={{ mb: 2 }}>
				Visual Inspection - {inspectionID}
			</Typography>
		</div>
	)
}

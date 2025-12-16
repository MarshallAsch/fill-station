import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import NextLink from 'next/link'
import ProTip from '@/components/ProTip'

export default function About() {
	return (
		<div className='max-w-7xl'>
			<Box
				sx={{
					my: 4,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Typography variant='h4' component='h1' sx={{ mb: 2 }}>
					Material UI - Next.js example in TypeScript
				</Typography>
				<Box sx={{ maxWidth: 'sm' }}>
					<Button variant='contained' component={NextLink} href='/'>
						Go to the home page
					</Button>
				</Box>
				<ProTip />
			</Box>
		</div>
	)
}

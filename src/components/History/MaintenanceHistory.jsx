import * as React from 'react'

import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Select from '@mui/material/Select'

import Paper from '@mui/material/Paper'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import OilBarrelIcon from '@mui/icons-material/OilBarrel'
import GradientIcon from '@mui/icons-material/Gradient'
import BuildIcon from '@mui/icons-material/Build'
import BiotechIcon from '@mui/icons-material/Biotech'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import relativeTime from 'dayjs/plugin/relativeTime'

import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import dayjs from 'dayjs'
dayjs.extend(relativeTime)

function itemColor(item) {
	switch (item.type) {
		case 'start':
			return 'secondary'
		case 'air-test':
			return 'info'
		case 'oil-change':
		case 'general':
			return 'warning'
		case 'filter-change':
			return 'grey'
		default:
			return 'error'
	}
}

function itemIcon(item) {
	switch (item.type) {
		case 'start':
			return <PlayArrowRoundedIcon />
		case 'air-test':
			return <BiotechIcon />
		case 'oil-change':
			return <OilBarrelIcon />
		case 'general':
			return <BuildIcon />
		case 'filter-change':
			return <GradientIcon />
		default:
			return <PriorityHighIcon />
	}
}

const timelineItems = [
	{
		date: dayjs('2024-11-21T00:00:00.000'),
		type: 'start',
		title: 'Got the compressor',
		subtitle: '',
	},
	{
		date: dayjs('2025-01-10T00:00:00.000'),
		type: 'air-test',
		title: 'Air analysis done',
		subtitle: 'Buro Veritas',
	},
	{
		date: dayjs('2025-11-10T00:00:00.000'),
		type: 'oil-change',
		title: 'Changed Oil',
		subtitle: '',
	},
	{
		date: dayjs('2025-03-10T00:00:00.000'),
		type: 'filter-change',
		title: 'Changed Filter',
		subtitle: 'P21 on the compressor',
	},
	{
		date: dayjs('2025-07-10T00:00:00.000'),
		type: 'filter-change',
		title: 'Changed Filter',
		subtitle: 'P21 on the compressor',
	},
	{
		date: dayjs('2025-11-09T00:00:00.000'),
		type: 'filter-change',
		title: 'Changed Filter',
		subtitle: 'P21 on the compressor',
	},
	{
		date: dayjs('2025-11-09T00:00:00.000'),
		type: 'air-test',
		title: 'Air analysis done',
		subtitle: 'Aircheck Lab',
	},
	{
		date: dayjs('2025-11-10T00:00:00.000'),
		type: 'filter-change',
		title: 'Changed Filter',
		subtitle: 'P61 on the wall',
	},
	{
		date: dayjs('2025-11-10T00:00:00.000'),
		type: 'general',
		title: 'General Service',
		subtitle: 'Inspected things',
	},
]

// sort so the oldest is at the bottom
timelineItems.sort((a, b) => b.date - a.date)

export default function MaintenanceHistory() {
	const [open, toggleOpen] = React.useState(false)

	const [dialogValue, setDialogValue] = React.useState({
		date: dayjs(),
		iconName: null,
		title: '',
		type: '',
	})

	const handleClose = () => {
		setDialogValue({
			date: dayjs(),
			iconName: null,
			title: '',
			type: '',
		})
		toggleOpen(false)
	}

	const handleSubmit = (event) => {
		event.preventDefault()

		console.log(dialogValue)

		// setValue({
		//   name: dialogValue.name,
		//   nitroxCert: dialogValue.nitroxCert,
		//   advancedNitroxCert: dialogValue.advancedNitroxCert,
		//   trimixCert: dialogValue.trimixCert,
		// });
		handleClose()
	}

	return (
		<Paper sx={{ minWidth: '100%', overflow: 'hidden' }}>
			<Fab
				color='secondary'
				variant='extended'
				onClick={() => toggleOpen(true)}
			>
				<AddIcon />
				Record Compressor Service
			</Fab>

			<Timeline position='alternate'>
				{timelineItems.map((item, index) => {
					return (
						<TimelineItem key={index}>
							<TimelineOppositeContent
								sx={{ m: 'auto 0' }}
								align='right'
								variant='body2'
								color='text.secondary'
							>
								<Tooltip title={item.date.format('MMMM DD, YYYY')}>
									{item.date.fromNow()}
								</Tooltip>
							</TimelineOppositeContent>

							<TimelineSeparator>
								<TimelineConnector />
								<TimelineDot color={itemColor(item)}>
									{itemIcon(item)}
								</TimelineDot>
								<TimelineConnector />
							</TimelineSeparator>

							<TimelineContent sx={{ py: '12px', px: 2 }}>
								<Typography variant='h6' component='span'>
									{item.title}
								</Typography>
								<Typography>{item.subtitle}</Typography>
							</TimelineContent>
						</TimelineItem>
					)
				})}
			</Timeline>

			<Dialog open={open} onClose={handleClose}>
				<form onSubmit={handleSubmit}>
					<DialogTitle>Compressor Maintenance</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Perform some Maintenance on the compressor to show up in the
							history
						</DialogContentText>

						<Stack spacing={2}>
							<TextField
								autoFocus
								margin='dense'
								id='title'
								value={dialogValue.title}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										title: event.target.value,
									})
								}
								label='What was done?'
								type='text'
								variant='standard'
							/>

							<TextField
								autoFocus
								margin='dense'
								id='subtitle'
								value={dialogValue.subtitle}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										subtitle: event.target.value,
									})
								}
								label='Extra Information'
								type='text'
								variant='standard'
							/>

							<FormControl fullWidth>
								<InputLabel id='service-type'>Service Type</InputLabel>
								<Select
									labelId='service-type'
									id='service-type'
									label='Service Type'
									value={dialogValue.type}
									onChange={(event) =>
										setDialogValue({
											...dialogValue,
											type: event.target.value,
										})
									}
								>
									<MenuItem value='oil-change'>
										<ListItemIcon>
											<OilBarrelIcon fontSize='medium' color='warning' />
										</ListItemIcon>
										<ListItemText>Oil Change</ListItemText>
									</MenuItem>

									<MenuItem value='filter-change'>
										<ListItemIcon>
											<GradientIcon fontSize='medium' />
										</ListItemIcon>
										<ListItemText>Filter Change</ListItemText>
									</MenuItem>

									<MenuItem value='air-test'>
										<ListItemIcon>
											<BiotechIcon fontSize='medium' color='info' />
										</ListItemIcon>
										<ListItemText>Air Test</ListItemText>
									</MenuItem>
									<MenuItem value='general'>
										<ListItemIcon>
											<BuildIcon fontSize='medium' color='warning' />
										</ListItemIcon>
										<ListItemText>General Service</ListItemText>
									</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button type='submit'>Add</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Paper>
	)
}

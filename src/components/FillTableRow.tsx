import React, { SetStateAction, useState } from 'react'

import FormHelperText from '@mui/material/FormHelperText'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'

import CancelIcon from '@mui/icons-material/Cancel'

import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import { Fill } from '@/redux/fills/fillsSlice'
import CylinderPicker from './UI/FormElements/CylinderPicker'
import { Client } from '@/redux/client/clientSlice'

type Props = {
	index: number
	item: Fill
	client: Client | null
	onCancel: (index: number) => void
}

export default function FillTableRow({ index, item, client, onCancel }: Props) {
	const nitroxUse = client && (client.nitroxCert || client.advancedNitroxCert)
	const advancedNitroxUse = client && client.advancedNitroxCert
	const trimixUse = client && client.trimixCert

	const [typeValue, setType] = useState(item.type)

	const [oxygenAmount, setOxygen] = useState(item.o2)
	const [heliumAmount, setHelium] = useState(item.he)
	const [startPressure, setStartPressure] = useState(item.start)
	const [endPressure, setEndPressure] = useState(item.end)

	const [oxygenError, setOxygenError] = useState('')
	const [heliumError, setHeliumError] = useState('')

	const [startError, setStartError] = useState('')
	const [endError, setEndError] = useState('')

	const handleTypeChange = (event: {
		target: { value: SetStateAction<string> }
	}) => {
		setType(event.target.value as Fill['type'])
	}

	return (
		<TableRow key={index}>
			<TableCell align='center'>
				<CylinderPicker />
			</TableCell>

			<TableCell>
				<FormControl fullWidth>
					<InputLabel id='fill-type'>Fill Type</InputLabel>
					<Select
						labelId='fill-type'
						id='fill-type'
						label='Fill Type'
						value={typeValue}
						onChange={handleTypeChange}
					>
						<MenuItem value='air'>Air</MenuItem>
						<Tooltip title={!nitroxUse && 'Not certified for nitrox'}>
							<div>
								<MenuItem value='nitrox' disabled={!nitroxUse}>
									Nitrox
								</MenuItem>
							</div>
						</Tooltip>
						<Tooltip title={!trimixUse && 'Not certified for trimix'}>
							<div>
								<MenuItem value='trimix' disabled={!trimixUse}>
									Trimix
								</MenuItem>
							</div>
						</Tooltip>
					</Select>
				</FormControl>
			</TableCell>

			<TableCell>
				<FormControl
					disabled={typeValue == 'air'}
					error={oxygenError != ''}
					variant='standard'
				>
					<InputLabel htmlFor='oxygen'>Oxygen %</InputLabel>
					<Input
						type='number'
						id='oxygen'
						value={oxygenAmount}
						onChange={(event) => {
							let value = Number(event.target.value)
							setOxygen(value)

							if (isNaN(value)) {
								setOxygenError('Must be a number')
							} else if (value < 20.9 && typeValue != 'trimix') {
								setOxygenError('Must not be hypoxic')
							} else if (value <= 0 || value > 100) {
								setOxygenError('Must be between 0 and 100%')
							} else if (value > 40 && !advancedNitroxUse) {
								setOxygenError(
									'Must be certified for advanced nitrox to use mixes over 40%',
								)
							} else {
								setOxygenError('')
							}
						}}
						aria-describedby='oxygen-text'
					/>
					{oxygenError && (
						<FormHelperText id='oxygen-text'>{oxygenError}</FormHelperText>
					)}
				</FormControl>

				<FormControl
					disabled={typeValue != 'trimix'}
					error={heliumError != ''}
					variant='standard'
				>
					<InputLabel htmlFor='helium'>Helium %</InputLabel>
					<Input
						type='number'
						id='helium'
						value={heliumAmount}
						onChange={(event) => {
							let value = Number(event.target.value)

							setHelium(value)

							if (isNaN(value)) {
								setHeliumError('Must be a number')
							} else if (value <= 0 || value > 100) {
								setHeliumError('Must be between 0 and 100%')
							} else {
								setHeliumError('')
							}
						}}
						aria-describedby='helium-text'
					/>
					{heliumError && (
						<FormHelperText id='helium-text'>{heliumError}</FormHelperText>
					)}
				</FormControl>
			</TableCell>

			<TableCell>
				<FormControl error={startError != ''} variant='standard'>
					<InputLabel htmlFor='start-pressure'>Start Pressure</InputLabel>
					<Input
						type='number'
						id='start-pressure'
						value={startPressure}
						onChange={(event) => {
							let value = Number(event.target.value)
							setStartPressure(value)

							if (isNaN(value)) {
								setStartError('Must be a number')
							} else if (value < 0) {
								setStartError('Must be above 0')
							} else if (value > endPressure) {
								setStartError('Start must be less than end pressure')
								!endError && setEndError('Must be more than the start pressure')
							} else {
								setStartError('')
								if (endError == 'Must be more than the start pressure') {
									setEndError('')
								}
							}
						}}
						aria-describedby='start-pressure-text'
					/>
					{startError && (
						<FormHelperText id='start-pressure-text'>
							{startError}
						</FormHelperText>
					)}
				</FormControl>
			</TableCell>

			<TableCell>
				<FormControl error={endError != ''} variant='standard'>
					<InputLabel htmlFor='end-pressure'>End Pressure</InputLabel>
					<Input
						type='number'
						id='end-pressure'
						value={endPressure}
						onChange={(event) => {
							let value = Number(event.target.value)
							setEndPressure(value)

							if (isNaN(value)) {
								setEndError('Must be a number')
							} else if (value < 0) {
								setEndError('Must be above 0')
							} else if (value <= startPressure) {
								setEndError('Must be more than the start pressure')
								!startError &&
									setStartError('Start must be less than end pressure')
							} else {
								setEndError('')
								if (startError == 'Start must be less than end pressure') {
									setStartError('')
								}
							}
						}}
						aria-describedby='end-pressure-text'
					/>
					{endError && (
						<FormHelperText id='end-pressure-text'>{endError}</FormHelperText>
					)}
				</FormControl>
			</TableCell>

			<TableCell align='right'>
				<Tooltip title='Cancel'>
					<IconButton
						edge='end'
						aria-label='cancel'
						onClick={() => {
							onCancel(index)
						}}
					>
						<CancelIcon />
					</IconButton>
				</Tooltip>
			</TableCell>
		</TableRow>
	)
}

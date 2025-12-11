import * as React from 'react'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

import Stack from '@mui/material/Stack'

import { useAppSelector } from '@/redux/hooks'

import { Client } from '@/redux/client/clientSlice'

// ES 2015

const filter = createFilterOptions()

type Props = {
	value: Client | null
	onChange: (value: Client) => void
}

export default function PersonPicker({ value: inValue, onChange }: Props) {
	const { allClients: clients } = useAppSelector((state) => state.clients)

	const [value, setValue] = React.useState<Client | null>(inValue)
	const [open, toggleOpen] = React.useState(false)

	const handleClose = () => {
		toggleOpen(false)
		setDialogValue({
			id: 0,
			name: '',
			nitroxCert: '',
			advancedNitroxCert: '',
			trimixCert: '',
		})
	}

	const [dialogValue, setDialogValue] = React.useState<Client>({
		id: 0,
		name: '',
		nitroxCert: '',
		advancedNitroxCert: '',
		trimixCert: '',
	})

	const handleSubmit = (event) => {
		event.preventDefault()

		console.log(dialogValue)

		setValue({
			id: 0,
			name: dialogValue.name,
			nitroxCert: dialogValue.nitroxCert,
			advancedNitroxCert: dialogValue.advancedNitroxCert,
			trimixCert: dialogValue.trimixCert,
		})
		handleClose()
	}

	return (
		<React.Fragment>
			<Autocomplete
				value={value}
				onChange={(event, newValue: string | Client | any | null) => {
					if (typeof newValue === 'string') {
						// timeout to avoid instant validation of the dialog's form.
						setTimeout(() => {
							toggleOpen(true)
							setDialogValue({
								id: 0,
								name: newValue,
								nitroxCert: '',
								advancedNitroxCert: '',
								trimixCert: '',
							})
						})
					} else if (newValue && newValue.inputValue) {
						toggleOpen(true)
						setDialogValue({
							id: 0,
							name: newValue.inputValue,
							nitroxCert: '',
							advancedNitroxCert: '',
							trimixCert: '',
						})
					} else {
						setValue(newValue)
						onChange(newValue)
					}
				}}
				filterOptions={(options, params) => {
					const filtered = filter(options, params)

					if (params.inputValue !== '') {
						filtered.push({
							inputValue: params.inputValue,
							name: `Add "${params.inputValue}"`,
						})
					}

					return filtered
				}}
				id='free-solo-dialog-demo'
				options={clients}
				getOptionLabel={(option) => {
					// for example value selected with enter, right from the input
					if (typeof option === 'string') {
						return option
					}
					if (option.inputValue) {
						return option.inputValue
					}
					return option.name
				}}
				selectOnFocus
				clearOnBlur
				handleHomeEndKeys
				renderOption={(props, option) => {
					const { key, ...optionProps } = props
					return (
						<li key={key} {...optionProps}>
							{option.name}
						</li>
					)
				}}
				sx={{ width: 300 }}
				freeSolo
				renderInput={(params) => (
					<TextField {...params} label='Select a Person' />
				)}
			/>
			<Dialog open={open} onClose={handleClose}>
				<form onSubmit={handleSubmit}>
					<DialogTitle>New Person</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Add the new Persons information to save it for next time.
						</DialogContentText>

						<Stack spacing={2}>
							<TextField
								autoFocus
								margin='dense'
								id='name'
								value={dialogValue.name}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										name: event.target.value,
									})
								}
								label='Name'
								type='text'
								variant='standard'
							/>

							<TextField
								autoFocus
								margin='dense'
								id='nitrox'
								value={dialogValue.nitroxCert}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										nitroxCert: event.target.value,
									})
								}
								label='Nitrox Certification number and agency (<40%)'
								type='text'
								variant='standard'
							/>

							<TextField
								autoFocus
								margin='dense'
								id='advanced-nitrox'
								value={dialogValue.advancedNitroxCert}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										advancedNitroxCert: event.target.value,
									})
								}
								label='Advanced Nitrox Certification number and agency (40-100%)'
								type='text'
								variant='standard'
							/>

							<TextField
								autoFocus
								margin='dense'
								id='trimux'
								value={dialogValue.trimixCert}
								onChange={(event) =>
									setDialogValue({
										...dialogValue,
										trimixCert: event.target.value,
									})
								}
								label='Trimix Certification number and agency'
								type='text'
								variant='standard'
							/>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button type='submit'>Add</Button>
					</DialogActions>
				</form>
			</Dialog>
		</React.Fragment>
	)
}

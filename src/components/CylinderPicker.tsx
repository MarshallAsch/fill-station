'use client'
import React, { FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

import dayjs from 'dayjs'
import objectSupport from 'dayjs/plugin/objectSupport' // ES 2015
import { useAppSelector } from '@/redux/hooks'
import { Cylinder } from '@/redux/cylinder/cylinderSlice'

dayjs.extend(objectSupport)

const filter = createFilterOptions()

const CylinderPicker = () => {
	const { cylinders } = useAppSelector((state) => state)

	const [value, setValue] = React.useState<Cylinder | null>(null)
	const [open, toggleOpen] = React.useState(false)

	const handleClose = () => {
		setDialogValue({
			serialNumber: '',
			birthDate: null,
			lastHydro: null,
			lastVis: null,
			oxygenClean: false,
		})
		toggleOpen(false)
	}

	const [dialogValue, setDialogValue] = React.useState<Cylinder>({
		serialNumber: '',
		birthDate: null,
		lastHydro: null,
		lastVis: null,
		oxygenClean: false,
	})

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault()

		console.log(dialogValue)

		setValue({
			serialNumber: dialogValue.serialNumber,
			birthDate: dialogValue.birthDate,
			lastHydro: dialogValue.lastHydro,
			lastVis: dialogValue.lastVis,
			oxygenClean: dialogValue.oxygenClean,
		})
		handleClose()
	}

	return (
		<>
			<Autocomplete
				value={value}
				onChange={(event, newValue: string | Cylinder | any | null) => {
					if (typeof newValue === 'string') {
						// timeout to avoid instant validation of the dialog's form.
						setTimeout(() => {
							toggleOpen(true)
							setDialogValue({
								serialNumber: newValue,
								birthDate: null,
								lastHydro: null,
								lastVis: null,
								oxygenClean: false,
							})
						})
					} else if (newValue && newValue.inputValue) {
						toggleOpen(true)
						setDialogValue({
							serialNumber: newValue.inputValue,
							birthDate: null,
							lastHydro: null,
							lastVis: null,
							oxygenClean: false,
						})
					} else {
						setValue(newValue)
					}
				}}
				filterOptions={(options, params) => {
					const filtered = filter(options, params)

					if (params.inputValue !== '') {
						filtered.push({
							inputValue: params.inputValue,
							serialNumber: `Add "${params.inputValue}"`,
						})
					}

					return filtered
				}}
				id='free-solo-dialog-demo'
				options={cylinders}
				getOptionLabel={(option) => {
					// for example value selected with enter, right from the input
					if (typeof option === 'string') {
						return option
					}
					if (option.inputValue) {
						return option.inputValue
					}
					return option.serialNumber
				}}
				selectOnFocus
				clearOnBlur
				handleHomeEndKeys
				renderOption={(props, option) => {
					const { key, ...optionProps } = props
					return (
						<li key={key} {...optionProps}>
							{option.serialNumber}
						</li>
					)
				}}
				sx={{ width: 300 }}
				freeSolo
				renderInput={(params) => (
					<TextField {...params} label='Select a cylinder' />
				)}
			/>
		</>
	)
}

export default CylinderPicker

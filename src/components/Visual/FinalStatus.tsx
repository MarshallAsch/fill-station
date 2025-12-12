'use client'

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import FormGroup from '../UI/FormGroup'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { BOOL_OPTIONS } from '@/app/constants/FormConstants'
import RadioGroup from '../UI/FormElements/RadioGroup'

const FinalStatus = () => {
	return (
		<FormGroup title='Final Status' description=''>
			<>
				<RadioGroup
					title='Cylinder Status'
					name='external_psi_standards'
					options={[
						{
							label: 'Acceptable',
							value: 'acceptable',
						},
						{
							label: 'Marginal',
							value: 'marginal',
						},
						{
							label: 'Reject',
							value: 'reject',
						},
					]}
				/>

				<DatePicker
					label='Inspection Date'
					name='date'
					defaultValue={dayjs()}
					disableFuture
				/>

				<RadioGroup
					title='Valve and Tank Cleaned for Oxygen Service'
					name='valve_tank_cleaned'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Valve and Tank Marked Clean for Oxygen Service'
					name='valve_tank_marked'
					options={BOOL_OPTIONS}
					description='If the tank and valve were already clean or if they were cleaned as
						part of this Vis'
				/>

				<FormControl fullWidth>
					<InputLabel id='inspector'>Inspector</InputLabel>
					<Select labelId='inspector' id='inspector' label='Inspector'>
						<MenuItem value='marshall'>Marshall Asch</MenuItem>
					</Select>
				</FormControl>
			</>
		</FormGroup>
	)
}

export default FinalStatus

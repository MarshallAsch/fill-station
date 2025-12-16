'use client'

import FormGroup from '../UI/FormGroup'
import { BOOL_OPTIONS } from '@/app/constants/FormConstants'
import RadioGroup from '../UI/FormElements/RadioGroup'
import DatePicker from '../UI/FormElements/DatePicker'
import ClientPicker from '../UI/FormElements/ClientPicker'

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

				<DatePicker title='Inspection Date' name='date' id='inspection_date' />

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

				<ClientPicker />
			</>
		</FormGroup>
	)
}

export default FinalStatus

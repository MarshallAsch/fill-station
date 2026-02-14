'use client'

import FormGroup from '../UI/FormGroup'
import {
	BOOL_OPTION_NO,
	BOOL_OPTIONS,
	PSI_INSPECTION_OPTION_ACCEPTABLE,
	PSI_INSPECTION_OPTIONS,
} from '@/app/constants/FormConstants'
import RadioGroup from '../UI/FormElements/RadioGroup'
import DatePicker from '../UI/FormElements/DatePicker'
import ClientPicker from '../UI/FormElements/ClientPicker'

const FinalStatus = () => {
	return (
		<FormGroup title='Final Status' description=''>
			<>
				<ClientPicker
					name={'inspectorId'}
					label={'Select the Inspector'}
					addLabel={'Add new Inspector'}
					filter={(c) => !!c.inspectionCert}
				/>
				<RadioGroup
					title='Cylinder Status'
					name='status'
					options={PSI_INSPECTION_OPTIONS}
					defaultValue={PSI_INSPECTION_OPTION_ACCEPTABLE}
				/>

				<DatePicker title='Inspection Date' name='date' id='inspection_date' />

				<RadioGroup
					title='Valve and Tank Cleaned for Oxygen Service'
					name='oxygenCleaned'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Valve and Tank Marked Clean for Oxygen Service'
					name='markedOxygenClean'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
					description='If the tank and valve were already clean or if they were cleaned as
						part of this Vis'
				/>
			</>
		</FormGroup>
	)
}

export default FinalStatus

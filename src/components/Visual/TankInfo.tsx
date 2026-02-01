'use client'

import FormGroup from '../UI/FormGroup'
import RadioGroup from '../UI/FormElements/RadioGroup'
import DatePicker from '../UI/FormElements/DatePicker'
import { CYLINDER_MATERIAL_OPTIONS } from '@/app/constants/FormConstants'

const TankInfo = () => {
	return (
		<FormGroup title='Tank Info' description=''>
			<>
				<DatePicker
					mode='month'
					title='First Hydro'
					name='firstHydro'
					id='first_hydro'
					description='The first hydro stamp on the cylinder'
				/>

				<DatePicker
					mode='month'
					title='Last Hydro'
					name='lastHydro'
					id='last_hydro'
					description='The most recent hydro stamp on the cylinder'
				/>

				<DatePicker
					mode='month'
					title='Last Vis'
					name='lastVis'
					id='last_vis'
					description='The most recent Vis sticker on the cylinder'
				/>

				<RadioGroup
					title='Cylinder Material'
					options={CYLINDER_MATERIAL_OPTIONS}
					name='cylinder_material'
				/>
			</>
		</FormGroup>
	)
}

export default TankInfo

'use client'

import MonthPicker from '../MonthPicker'
import FormGroup from '../UI/FormGroup'
import dayjs from 'dayjs'
import RadioGroup from '../UI/FormElements/RadioGroup'

const TankInfo = () => {
	return (
		<FormGroup title='Tank Info' description=''>
			<>
				<MonthPicker
					initialValue={dayjs()}
					name='firstHydro'
					label='First Hydro'
					helpText='The first hydro stamp on the cylinder'
				/>

				<MonthPicker
					initialValue={dayjs()}
					name='lastHydro'
					label='Last Hydro'
					helpText='The most recent hydro stamp on the cylinder'
				/>

				<MonthPicker
					initialValue={dayjs()}
					name='lastVis'
					label='Last Vis'
					helpText='The most recent Vis sticker on the cylinder'
				/>

				<RadioGroup
					title='Cylinder Material'
					options={[
						{
							label: 'Steel',
							value: 'steel',
						},
						{
							label: 'Aluminum',
							value: 'aluminum',
						},
						{
							label: 'Composite',
							value: 'composite',
						},
					]}
					name='cylinder_material'
				/>
			</>
		</FormGroup>
	)
}

export default TankInfo

import RadioGroup from '../UI/FormElements/RadioGroup'
import FormGroup from '../UI/FormGroup'
import { BOOL_OPTIONS } from '@/app/constants/FormConstants'

const Valve = () => {
	return (
		<FormGroup title='Valve' description=''>
			<>
				<RadioGroup
					title='Burst Disk Replaced'
					name='burst_disk_replaced'
					options={BOOL_OPTIONS}
				/>
				<RadioGroup
					title='O-Ring Replaced'
					name='oring_replaced'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Has Dip Tube'
					name='has_dip_tube'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Service Needed'
					name='service_needed'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Valve Rebuilt'
					name='valve_rebuilt'
					options={BOOL_OPTIONS}
				/>
			</>
		</FormGroup>
	)
}

export default Valve

import RadioGroup from '../UI/FormElements/RadioGroup'
import FormGroup from '../UI/FormGroup'
import {
	BOOL_OPTION_NO,
	BOOL_OPTION_YES,
	BOOL_OPTIONS,
} from '@/app/constants/FormConstants'

const Valve = () => {
	return (
		<FormGroup title='Valve' description=''>
			<>
				<RadioGroup
					title='Burst Disk Replaced'
					name='burstDiskReplaced'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>
				<RadioGroup
					title='O-Ring Replaced'
					name='oringReplaced'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_YES}
				/>

				<RadioGroup
					title='Has Dip Tube'
					name='dipTube'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_YES}
				/>

				<RadioGroup
					title='Service Needed'
					name='needService'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Valve Rebuilt'
					name='rebuilt'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>
			</>
		</FormGroup>
	)
}

export default Valve

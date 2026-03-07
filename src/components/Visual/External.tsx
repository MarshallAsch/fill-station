import FormGroup from '../UI/FormGroup'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'
import {
	BOOL_OPTION_NO,
	BOOL_OPTION_YES,
	BOOL_OPTIONS,
	PSI_INSPECTION_OPTION_ACCEPTABLE,
	PSI_INSPECTION_OPTIONS,
} from '@/app/constants/FormConstants'

const External = () => {
	return (
		<FormGroup title='External' description=''>
			<>
				<RadioGroup
					title='Evidence of Heat Damage'
					name='heat'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Evidence of Re-painting'
					name='painted'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Evidence of odor'
					name='odor'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Evidence of Bow'
					name='bow'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Hammer tone test - bell like sound'
					name='bell'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_YES}
					description='Make sure that the valve is removed first'
				/>

				<TextArea
					id='exterior-surface'
					name='exteriorDescription'
					placeholder='Description of exterior surface'
					ariaLabel='Exterior Surface'
				/>

				<TextArea
					id='exterior-marks'
					name='exteriorMarks'
					placeholder='Location and depth of marks, pits, gouges of more than 0.015"+'
					ariaLabel='Exterior Marks'
				/>

				<RadioGroup
					title='Line corrosion around boot and other accessories'
					name='lineCorrosion'
					options={BOOL_OPTIONS}
					defaultValue={BOOL_OPTION_NO}
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
					name='externalStandards'
					options={PSI_INSPECTION_OPTIONS}
					defaultValue={PSI_INSPECTION_OPTION_ACCEPTABLE}
				/>
			</>
		</FormGroup>
	)
}

export default External

import FormGroup from '../UI/FormGroup'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'
import { BOOL_OPTIONS } from '@/app/constants/FormConstants'

const External = () => {
	return (
		<FormGroup title='External' description=''>
			<>
				<RadioGroup
					title='Evidence of Heat Damage'
					name='heat_damage'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Evidence of Re-painting'
					name='repainting'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Evidence of odor'
					name='odor'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup title='Evidence of Bow' name='bow' options={BOOL_OPTIONS} />

				<RadioGroup
					title='Hammer tone test - bell like sound'
					name='hammer_tone'
					options={BOOL_OPTIONS}
					description='Make sure that the valve is removed first'
				/>

				<TextArea
					id='exterior-surface'
					name='exterior_surface'
					placeholder='Description of exterior surface'
					ariaLabel='Exterior Surface'
				/>

				<TextArea
					id='exterior-marks'
					name='exterior_marks'
					placeholder='Location and depth of marks, pits, gouges of more than 0.015"+'
					ariaLabel='Exterior Marks'
				/>

				<RadioGroup
					title='Line corrosion around boot and other accessories'
					name='corrosion'
					options={BOOL_OPTIONS}
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
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
							label: 'Condemn',
							value: 'condemn',
						},
					]}
				/>
			</>
		</FormGroup>
	)
}

export default External

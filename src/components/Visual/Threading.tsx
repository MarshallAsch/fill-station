import FormGroup from '../UI/FormGroup'
import NumberField from '../UI/FormElements/NumberField'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'
import {
	PSI_INSPECTION_OPTION_ACCEPTABLE,
	PSI_INSPECTION_OPTIONS,
} from '@/app/constants/FormConstants'

const Threading = () => {
	return (
		<FormGroup title='Threading' description=''>
			<>
				<TextArea
					id='thread-description'
					name='thread_description'
					placeholder='Description'
					ariaLabel='Thread Description'
				/>

				<NumberField
					id='damagedThreads'
					name='damagedThreads'
					min={0}
					max={20}
					helperText='How many damaged threads are visible?'
				/>

				<TextArea
					id='oring-surface'
					name='oring_surface'
					placeholder='O-ring surface'
					ariaLabel='O-ring Surface'
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
					name='threading_psi_standards'
					options={PSI_INSPECTION_OPTIONS}
					defaultValue={PSI_INSPECTION_OPTION_ACCEPTABLE}
				/>
			</>
		</FormGroup>
	)
}

export default Threading

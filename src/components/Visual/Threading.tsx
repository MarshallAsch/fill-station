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
					name='threadingDescription'
					placeholder='Description'
					ariaLabel='Thread Description'
				/>

				<NumberField
					id='damagedThreads'
					name='badThreadCount'
					min={0}
					max={20}
					helperText='How many damaged threads are visible?'
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
					name='threadingStandards'
					options={PSI_INSPECTION_OPTIONS}
					defaultValue={PSI_INSPECTION_OPTION_ACCEPTABLE}
				/>
			</>
		</FormGroup>
	)
}

export default Threading

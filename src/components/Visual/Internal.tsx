import FormGroup from '../UI/FormGroup'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'
import {
	PSI_INSPECTION_OPTION_ACCEPTABLE,
	PSI_INSPECTION_OPTIONS,
} from '@/app/constants/FormConstants'

const Internal = () => {
	return (
		<FormGroup title='Internal' description=''>
			<>
				<TextArea
					id='contents'
					name='internalContents'
					placeholder='Amount and composition of content'
					ariaLabel='Contents'
					description='If any stuff was in the tank when it was flipped upside down'
				/>

				<TextArea
					id='internal-surface'
					name='internalDescription'
					placeholder='Description of Internal Surface'
					ariaLabel='Internal Surface'
				/>

				<TextArea
					id='internal-pitting'
					name='internalMarks'
					placeholder='Location and estimated depth of any pitting'
					ariaLabel='Internal Pitting'
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
					name='internalStandards'
					options={PSI_INSPECTION_OPTIONS}
					defaultValue={PSI_INSPECTION_OPTION_ACCEPTABLE}
				/>
			</>
		</FormGroup>
	)
}

export default Internal

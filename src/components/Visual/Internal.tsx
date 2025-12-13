import FormGroup from '../UI/FormGroup'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'

const Internal = () => {
	return (
		<FormGroup title='Internal' description=''>
			<>
				<TextArea
					id='contents'
					name='contents'
					placeholder='Amount and composition of content'
					ariaLabel='Contents'
					description='If any stuff was in the tank when it was flipped upside down'
				/>

				<TextArea
					id='internal-surface'
					name='internal_surface'
					placeholder='Description of Internal Surface'
					ariaLabel='Internal Surface'
				/>

				<TextArea
					id='internal-pitting'
					name='internal_pitting'
					placeholder='Location and estimated depth of any pitting'
					ariaLabel='Internal Pitting'
				/>

				<RadioGroup
					title='Comparison to PSI Standards/Manufacturers'
					name='internal_psi_standards'
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

export default Internal

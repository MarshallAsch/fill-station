import FormGroup from '../UI/FormGroup'
import NumberField from '../NumberField'
import TextArea from '../UI/FormElements/TextArea'
import RadioGroup from '../UI/FormElements/RadioGroup'

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

export default Threading

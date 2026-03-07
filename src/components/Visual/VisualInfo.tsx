import RadioGroup from '../UI/FormElements/RadioGroup'
import FormGroup from '../UI/FormGroup'

const VisualInfo = () => {
	return (
		<FormGroup title='Vis Info' description=''>
			<RadioGroup
				title='Valve Type'
				name='valve'
				options={[
					{
						label: 'Din',
						value: 'din',
					},
					{
						label: 'K (Standard Yoke)',
						value: 'k',
					},
					{
						label: 'H',
						value: 'h',
					},
					{
						label: 'None',
						value: 'none',
					},
				]}
			/>
		</FormGroup>
	)
}

export default VisualInfo

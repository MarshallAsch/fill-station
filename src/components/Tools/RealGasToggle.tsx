'use client'

import Checkbox from '@/components/UI/FormElements/CheckBox'
import { useUnits } from './UnitsProvider'

// Global compressibility setting — shared by every tool via UnitsProvider, so it
// only needs to be set once.
const RealGasToggle = () => {
	const { useRealGas, setUseRealGas } = useUnits()
	return (
		<Checkbox
			id='real-gas'
			name='real-gas'
			title='Account for gas compressibility (real-gas, approximate)'
			checked={useRealGas}
			onChange={setUseRealGas}
		/>
	)
}

export default RealGasToggle

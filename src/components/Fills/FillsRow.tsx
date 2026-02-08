import { XCircleIcon } from '@heroicons/react/24/outline'
import CylinderPicker from '../UI/FormElements/CylinderPicker'
import FillType from './FillType'
import { removeFill, updateFill } from '@/redux/fills/fillsSlice'
import NumberInput from '../UI/FormElements/NumberInput'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Fill } from '@/types/fills'

const FillsRow = ({ fill }: { fill: Fill }) => {
	const fills = useAppSelector((state) => state.fills)
	const dispatch = useAppDispatch()
	const client = useAppSelector((state) => state.clients.selectedClient)

	return (
		<tr key={fill.id}>
			<td className='py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				<CylinderPicker
					filter={(c) => !client || client.id == c.ownerId}
					initialValue={fill.cylinder}
					onChange={(val) =>
						dispatch(
							updateFill({
								id: fill.id,
								data: {
									...fill,
									cylinder: val || undefined,
									end: fill.end === 0 && val ? val.servicePressure : fill.end,
								},
							}),
						)
					}
				/>
			</td>
			<td className='py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
				<FillType index={fill.id} item={fill} />
			</td>
			<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
				<NumberInput
					id='oxygen-input'
					name='oxygen'
					label='Oxygen %'
					disabled={fill.type === 'air'}
					value={fill.o2}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, o2: val } }))
					}
				/>
				<NumberInput
					id='helium-input'
					name='helium'
					label='Helium %'
					value={fill.he}
					disabled={fill.type !== 'trimix'}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, he: val } }))
					}
				/>
			</td>
			<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
				<NumberInput
					id='starting-input'
					name='startPressure'
					label='Start Pressure'
					value={fill.start}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, start: val } }))
					}
				/>
			</td>
			<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
				<NumberInput
					id='ending-input'
					name='endPressure'
					label='End Pressure'
					value={fill.end}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, end: val } }))
					}
				/>
			</td>
			<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6'>
				<button
					className='cursor-pointer disabled:cursor-not-allowed'
					disabled={fills.length <= 1}
					onClick={() => dispatch(removeFill(fill.id))}
				>
					<XCircleIcon className='h-5 w-5' />
				</button>
			</td>
		</tr>
	)
}

export default FillsRow

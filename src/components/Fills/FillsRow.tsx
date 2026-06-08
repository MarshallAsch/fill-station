import { XCircleIcon } from '@heroicons/react/24/outline'
import CylinderPicker from '../UI/FormElements/CylinderPicker'
import FillType from './FillType'
import { removeFill, updateFill } from '@/redux/fills/fillsSlice'
import NumberInput from '../UI/FormElements/NumberInput'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'

type FillsRowProps = {
	disableDelete?: boolean
	fill: Fill
	client: Client | null
}

const FillsRow = ({ disableDelete = false, fill, client }: FillsRowProps) => {
	const dispatch = useAppDispatch()
	const usedCylinders = useAppSelector((state) => state.fills)
		.fills.flatMap((f) => [f.cylinder?.id, f.pairedCylinder?.id])
		.filter((id) => id !== undefined)

	return (
		<tr key={fill.id}>
			<td className='text-text py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-6'>
				<CylinderPicker
					filter={(c) =>
						(!client || client.id == c.ownerId) && !usedCylinders.includes(c.id)
					}
					initialValue={fill.cylinder}
					onChange={(val) =>
						dispatch(
							updateFill({
								id: fill.id,
								data: {
									...fill,
									cylinder: val || undefined,
									pairedCylinder: val?.pairedCylinder
										? (val.pairedCylinder as Cylinder)
										: undefined,
									end: fill.end === 0 && val ? val.servicePressure : fill.end,
								},
							}),
						)
					}
				/>
				{fill.pairedCylinder && (
					<div className='text-light-text mt-1 flex items-center gap-2 text-xs'>
						<span>
							+{' '}
							{fill.pairedCylinder.nickname
								? `${fill.pairedCylinder.nickname} (${fill.pairedCylinder.serialNumber})`
								: fill.pairedCylinder.serialNumber}
						</span>
						<button
							type='button'
							className='underline'
							onClick={() =>
								dispatch(
									updateFill({
										id: fill.id,
										data: { ...fill, pairedCylinder: undefined },
									}),
								)
							}
						>
							unlink
						</button>
					</div>
				)}
			</td>
			<td className='text-text py-4 text-sm font-medium whitespace-nowrap'>
				<FillType
					index={fill.id}
					item={fill}
					client={client || undefined}
					cylinder={fill.cylinder}
					pairedCylinder={fill.pairedCylinder}
				/>
			</td>
			<td className='text-light-text px-3 py-4 text-sm whitespace-nowrap'>
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
			<td className='text-light-text px-3 py-4 text-sm whitespace-nowrap'>
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
			<td className='text-light-text px-3 py-4 text-sm whitespace-nowrap'>
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
					disabled={disableDelete}
					onClick={() => dispatch(removeFill(fill.id))}
				>
					<XCircleIcon className='h-5 w-5' />
				</button>
			</td>
		</tr>
	)
}

export default FillsRow

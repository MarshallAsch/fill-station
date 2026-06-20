import { removeFill, updateFill } from '@/redux/fills/fillsSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Client } from '@/types/client'
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
import { XCircleIcon } from '@heroicons/react/24/outline'
import CylinderPicker from '../UI/FormElements/CylinderPicker'
import FillType from './FillType'
import NumberInput from '../UI/FormElements/NumberInput'

type FillsRowProps = {
	disableDelete?: boolean
	fill: Fill
	client: Client | null
	index: number
}

const FillCard = ({
	disableDelete = false,
	fill,
	client,
	index,
}: FillsRowProps) => {
	const dispatch = useAppDispatch()
	const usedCylinders = useAppSelector((state) => state.fills)
		.fills.flatMap((f) => [f.cylinder?.id, f.pairedCylinder?.id])
		.filter((id) => id !== undefined)
	return (
		<div className='bg-surface flex min-w-full flex-col gap-2 rounded p-4'>
			<div className='flex w-full justify-between'>
				<p className='text-light-text text-xl'>Fill {index}</p>
				<button
					className='cursor-pointer disabled:cursor-not-allowed'
					disabled={disableDelete}
					onClick={() => dispatch(removeFill(fill.id))}
				>
					<XCircleIcon className='h-10 w-10' />
				</button>
			</div>
			<CylinderPicker
				isFill
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
				<div className='text-light-text flex items-center gap-2 text-sm'>
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
			<FillType
				index={fill.id}
				item={fill}
				client={client || undefined}
				cylinder={fill.cylinder}
				pairedCylinder={fill.pairedCylinder}
			/>
			<div className='flex flex-row gap-2'>
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
			</div>
			<div className='flex flex-row gap-2'>
				<NumberInput
					id='starting-input'
					name='startPressure'
					label='Start Pressure'
					value={fill.start}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, start: val } }))
					}
				/>
				<NumberInput
					id='ending-input'
					name='endPressure'
					label='End Pressure'
					value={fill.end}
					onChange={(val: number) =>
						dispatch(updateFill({ id: fill.id, data: { ...fill, end: val } }))
					}
				/>
			</div>
		</div>
	)
}

export default FillCard

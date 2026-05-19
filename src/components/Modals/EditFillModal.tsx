'use client'

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Button from '../UI/Button'
import DatePicker from '../UI/FormElements/DatePicker'
import NumberInput from '../UI/FormElements/NumberInput'
import { updateFill } from '@/app/_api'
import { FillHistory } from '@/types/fills'

type EditFillModalProps = {
	fill: FillHistory | null
	onClose: () => void
}

const EditFillModal = ({ fill, onClose }: EditFillModalProps) => {
	const queryClient = useQueryClient()
	const [date, setDate] = useState<Dayjs>(fill ? dayjs(fill.date) : dayjs())
	const [start, setStart] = useState(fill?.startPressure ?? 0)
	const [end, setEnd] = useState(fill?.endPressure ?? 0)
	const [oxygen, setOxygen] = useState(fill?.oxygen ?? 20.9)
	const [helium, setHelium] = useState(fill?.helium ?? 0)
	const [saving, setSaving] = useState(false)

	const handleSave = async () => {
		if (!fill) return
		setSaving(true)
		const result = await updateFill(fill.id, {
			date: date.toISOString(),
			startPressure: start,
			endPressure: end,
			oxygen,
			helium,
		})
		setSaving(false)
		if (typeof result === 'string') {
			toast.error(`Failed to update fill: ${result}`)
			return
		}
		toast.success('Fill updated')
		queryClient.invalidateQueries({ queryKey: ['fills'] })
		onClose()
	}

	return (
		<Transition show={fill !== null} as={Fragment}>
			<Dialog
				as='div'
				key={fill?.id}
				onClose={onClose}
				className='relative z-50'
			>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-200'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-150'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black/30 transition-opacity' />
				</TransitionChild>
				<div className='fixed inset-0 z-50'>
					<div className='flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0'>
						<TransitionChild
							as={Fragment}
							enter='ease-out duration-200'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-150'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						>
							<DialogPanel className='bg-background w-full max-w-lg rounded-lg p-6 shadow-xl sm:my-8'>
								<DialogTitle className='text-text text-lg font-semibold'>
									Edit fill
								</DialogTitle>
								<p className='text-light-text mt-1 text-sm'>
									{fill?.Cylinder?.nickname ?? fill?.Cylinder?.serialNumber}
								</p>

								<div className='mt-4 flex flex-col gap-4'>
									<DatePicker
										title='Fill date'
										id='edit-fill-date'
										name='date'
										value={date}
										onChange={setDate}
									/>
									<div className='grid grid-cols-2 gap-4'>
										<NumberInput
											id='edit-fill-start'
											name='startPressure'
											label='Start pressure (psi)'
											value={start}
											onChange={setStart}
										/>
										<NumberInput
											id='edit-fill-end'
											name='endPressure'
											label='End pressure (psi)'
											value={end}
											onChange={setEnd}
										/>
										<NumberInput
											id='edit-fill-oxygen'
											name='oxygen'
											label='Oxygen %'
											value={oxygen}
											onChange={setOxygen}
										/>
										<NumberInput
											id='edit-fill-helium'
											name='helium'
											label='Helium %'
											value={helium}
											onChange={setHelium}
										/>
									</div>
								</div>

								<div className='mt-6 flex justify-end gap-2'>
									<Button variant='ghost' onClick={onClose} disabled={saving}>
										Cancel
									</Button>
									<Button onClick={handleSave} disabled={saving}>
										{saving ? 'Saving…' : 'Save'}
									</Button>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default EditFillModal

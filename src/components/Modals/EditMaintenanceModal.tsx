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
import TextInput from '../UI/FormElements/TextInput'
import { updateMaintenance } from '@/app/_api'
import { CompressorMaintenance } from '@/types/maintenance'

type EditMaintenanceModalProps = {
	record: CompressorMaintenance | null
	onClose: () => void
}

const EditMaintenanceModal = ({
	record,
	onClose,
}: EditMaintenanceModalProps) => {
	const queryClient = useQueryClient()
	const [date, setDate] = useState<Dayjs>(record ? dayjs(record.date) : dayjs())
	const [hours, setHours] = useState(record?.hours ?? 0)
	const [description, setDescription] = useState(record?.description ?? '')
	const [saving, setSaving] = useState(false)

	const handleSave = async () => {
		if (!record) return
		setSaving(true)
		const result = await updateMaintenance(record.id, {
			date: date.toISOString(),
			hours,
			description,
		})
		setSaving(false)
		if (typeof result === 'string') {
			toast.error(`Failed to update record: ${result}`)
			return
		}
		toast.success('Maintenance record updated')
		queryClient.invalidateQueries({ queryKey: ['maintenance'] })
		queryClient.invalidateQueries({ queryKey: ['maintenance-summary'] })
		onClose()
	}

	return (
		<Transition show={record !== null} as={Fragment}>
			<Dialog
				as='div'
				key={record?.id}
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
									Edit maintenance record
								</DialogTitle>

								<div className='mt-4 flex flex-col gap-4'>
									<DatePicker
										title='Service date'
										id='edit-maintenance-date'
										name='date'
										value={date}
										onChange={setDate}
									/>
									<NumberInput
										id='edit-maintenance-hours'
										name='hours'
										label='Compressor hours'
										value={hours}
										onChange={setHours}
									/>
									<TextInput
										id='edit-maintenance-description'
										name='description'
										type='text'
										ariaLabel='Description'
										placeholder='Description'
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
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

export default EditMaintenanceModal

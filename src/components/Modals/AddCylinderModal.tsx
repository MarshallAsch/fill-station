import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateAddCylinderModalOpen } from '@/redux/modal/modalSlice'
import {
	Button,
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { FormEvent, Fragment } from 'react'
import { Stack } from '@mui/material'
import MonthPicker from '../MonthPicker'
import dayjs from 'dayjs'
import Checkbox from '../UI/FormElements/CheckBox'
import TextInput from '../UI/FormElements/TextInput'

const AddCylinderModal = () => {
	const { addCylinderModalOpen } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()

	const handleClose = () => {
		dispatch(updateAddCylinderModalOpen(false))
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// For this to work properly, the name provided to each input should be unique and match the schema on the BE
		const form = new FormData(event.target as HTMLFormElement)
		const formData = Object.fromEntries(form.entries())

		console.log(formData)
	}
	return (
		<Transition show={addCylinderModalOpen} as={Fragment}>
			<Dialog as='div' onClose={handleClose} className='relative z-50'>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity' />
				</TransitionChild>
				<div className='fixed inset-0 z-50 overflow-y-auto'>
					<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
						<TransitionChild
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						>
							<DialogPanel className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
								<DialogTitle>New Cylinder</DialogTitle>
								<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
									<DialogTitle>
										Add the new cylinders information to save it for next time.
									</DialogTitle>
									<TextInput
										autoFocus
										type='text'
										id='serial-number'
										name='serial_number'
										ariaLabel='Serial Number'
										placeholder='Serial Number'
									/>

									<Stack direction='row' spacing={2}>
										<MonthPicker
											name='firstHydro'
											label='First Hydro'
											helpText='The first hydro stamp on the cylinder'
											initialValue={dayjs()}
										/>

										<MonthPicker
											name='lastHydro'
											label='Last Hydro'
											helpText='The most recent hydro stamp on the cylinder'
											initialValue={dayjs()}
										/>
									</Stack>

									<MonthPicker
										name='lastVis'
										label='Last Vis'
										helpText='The most recent Vis sticker on the cylinder'
										initialValue={dayjs()}
									/>

									<Checkbox
										title='Tank and Valve have been cleaned for oxygen service to 100%'
										id='tank-valve-cleaned'
										name='tank_valve_cleaned'
									/>

									<div className='flex w-full justify-end gap-2'>
										<Button onClick={handleClose}>Cancel</Button>
										<Button type='submit'>Add</Button>
									</div>
								</form>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default AddCylinderModal

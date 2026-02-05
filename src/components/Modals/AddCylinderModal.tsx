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
import TextInput from '../UI/FormElements/TextInput'
import { useQueryClient } from '@tanstack/react-query'
import RadioGroup from '../UI/FormElements/RadioGroup'
import {
	BOOL_OPTION_NO,
	BOOL_OPTIONS,
	CYLINDER_MATERIAL_OPTIONS,
} from '@/app/constants/FormConstants'
import ClientPicker from '../UI/FormElements/ClientPicker'
import DatePicker from '../UI/FormElements/DatePicker'

const AddCylinderModal = () => {
	const { addCylinderModalOpen } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()
	const queryClient = useQueryClient()

	const handleClose = () => {
		dispatch(updateAddCylinderModalOpen(false))
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// For this to work properly, the name provided to each input should be unique and match the schema on the BE
		const form = new FormData(event.target as HTMLFormElement)
		const formData = Object.fromEntries(form.entries())
		console.log(formData)

		// const data = await newCylinder(1, formData as NewCylinderDTO)
		// if (!(data instanceof String)) {
		// 	queryClient.invalidateQueries({ queryKey: ['cylinders'] })
		// 	handleClose()
		// }
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

									<ClientPicker disableAdd={true} />

									<TextInput
										autoFocus
										type='text'
										id='serial-number'
										name='serialNumber'
										ariaLabel='Serial Number'
										placeholder='Serial Number'
									/>

									<div className='flex flex-row space-x-2'>
										<DatePicker
											name='firstHydro'
											title='First Hydro'
											id='first-hydro'
										/>

										<DatePicker
											name='lastHydro'
											title='Last Hydro'
											id='last-hydro'
										/>
									</div>

									<DatePicker name='lastVis' title='Last Vis' id='last-vis' />

									<RadioGroup
										title='Cylinder material'
										name='material'
										options={CYLINDER_MATERIAL_OPTIONS}
									/>

									<RadioGroup
										title='Tank and Valve have been cleaned for oxygen service to 100%'
										name='oxygenClean'
										options={BOOL_OPTIONS}
										defaultValue={BOOL_OPTION_NO}
									/>

									<div className='flex w-full justify-end gap-2'>
										<Button
											onClick={handleClose}
											className='mt-3 inline-flex w-full cursor-pointer justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0'
										>
											Cancel
										</Button>
										<Button
											type='submit'
											className='inline-flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2'
										>
											Add
										</Button>
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

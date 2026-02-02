import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateAddServiceModalOpen } from '@/redux/modal/modalSlice'
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
import DatePicker from '../UI/FormElements/DatePicker'
import { MAINTENANCE_TYPE } from '@/redux/history/historySlice'
import ListBox from '../UI/FormElements/ListBox'

const SERVICE_ITEMS = [
	{
		id: 1,
		value: MAINTENANCE_TYPE.AIR_TEST,
		name: 'Air Test',
	},
	{
		id: 2,
		value: MAINTENANCE_TYPE.FILTER_CHANGE,
		name: 'Filter Change',
	},
	{
		id: 3,
		value: MAINTENANCE_TYPE.GENERAL,
		name: 'General Maintenance',
	},
	{
		id: 4,
		value: MAINTENANCE_TYPE.OIL_CHANGE,
		name: 'Oil Change',
	},
	{
		id: 5,
		value: MAINTENANCE_TYPE.START,
		name: 'Start of Compressor History',
	},
]

const AddServiceModal = () => {
	const { addServiceModalOpen } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()

	const handleClose = () => {
		dispatch(updateAddServiceModalOpen(false))
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// For this to work properly, the name provided to each input should be unique and match the schema on the BE
		const form = new FormData(event.target as HTMLFormElement)
		const formData = Object.fromEntries(form.entries())

		console.log(formData)
	}
	return (
		<Transition show={addServiceModalOpen} as={Fragment}>
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
					<div className='bg-opacity-75 fixed inset-0 bg-gray-500/80 transition-opacity' />
				</TransitionChild>
				<div className='fixed inset-0 z-50'>
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
							<DialogPanel className='transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
								<DialogTitle>New Cylinder</DialogTitle>
								<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
									<DialogTitle>Create Compressor Service Record</DialogTitle>
									<TextInput
										autoFocus
										type='text'
										id='title'
										name='title'
										ariaLabel='Service Title'
										placeholder='What was done?'
									/>

									<div className='flex flex-row space-x-2'>
										<DatePicker
											title='Date of Service'
											name='date'
											id='date'
											description=''
										/>
									</div>

									<ListBox
										items={SERVICE_ITEMS}
										title='Type of Service'
										name='maintenance_type'
										id='maintenance_type'
									/>

									<TextInput
										autoFocus
										type='text'
										id='description'
										name='description'
										ariaLabel='Description of Service'
										placeholder='Description of Service'
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

export default AddServiceModal

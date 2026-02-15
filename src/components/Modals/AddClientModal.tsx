import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateAddClientModalOpen } from '@/redux/modal/modalSlice'
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import TextInput from '../UI/FormElements/TextInput'
import { newClient } from '@/app/_api'
import { NewClientDTO } from '@/types/client'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../UI/Button'

const AddClientModal = () => {
	const { addClientModalOpen } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()
	const queryClient = useQueryClient()

	const handleClose = () => {
		dispatch(updateAddClientModalOpen(false))
	}

	const handleSubmit = async (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const data = await newClient(formData as NewClientDTO)
		if (!(data instanceof String)) {
			queryClient.invalidateQueries({ queryKey: ['clients'] })
			handleClose()
		}
	}
	return (
		<Transition show={addClientModalOpen} as={Fragment}>
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
								<DialogTitle>New Client</DialogTitle>
								<form className='flex flex-col gap-4' action={handleSubmit}>
									<DialogTitle>
										Add the new Clients information to save it for next time.
									</DialogTitle>
									<TextInput
										autoFocus
										type='text'
										id='name'
										name='name'
										ariaLabel='Name'
										placeholder='First and Last Name'
									/>

									<TextInput
										autoFocus
										type='text'
										id='nitroxCert'
										name='nitroxCert'
										ariaLabel='Nitrox Certification'
										placeholder='Certification number to use <40% nitrox'
									/>

									<TextInput
										autoFocus
										type='text'
										id='advancedNitroxCert'
										name='advancedNitroxCert'
										ariaLabel='Advanced Nitrox Certification'
										placeholder='Certification number to use up to 100% oxygen'
									/>

									<TextInput
										autoFocus
										type='text'
										id='trimixCert'
										name='trimixCert'
										ariaLabel='Trimix Certification'
										placeholder='Certification number to helium in the breathing mix'
									/>

									<TextInput
										autoFocus
										type='text'
										id='inspectionCert'
										name='inspectionCert'
										ariaLabel='Visual Inspection Certification'
										placeholder='Certification number to perform visual inspections on tanks'
									/>

									<div className='flex w-full justify-end gap-2'>
										<Button variant='ghost' onClick={handleClose}>
											Cancel
										</Button>
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

export default AddClientModal

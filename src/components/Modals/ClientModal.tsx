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
import { Client, NewClientDTO } from '@/types/client'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../UI/Button'

export type ClientModalProps = {
	title?: string
	description?: string
	cancelText?: string
	submitText?: string
	client?: Client
	onSubmit?: (client: NewClientDTO) => Promise<Client | string>
	handleClose: () => void
}

const ClientModal = ({
	title = 'New Client',
	description = 'Add the new Clients information to save it for next time.',
	submitText = 'Add',
	cancelText = 'Cancel',
	client,
	handleClose,
	onSubmit = newClient,
}: ClientModalProps) => {
	const queryClient = useQueryClient()
	const handleSubmit = async (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const result = await onSubmit(formData as NewClientDTO)
		if (!(result instanceof String)) {
			queryClient.invalidateQueries({ queryKey: ['clients'] })
			handleClose()
		}
	}
	return (
		<Transition show={true} as={Fragment}>
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
								<DialogTitle>{title}</DialogTitle>
								<form className='flex flex-col gap-4' action={handleSubmit}>
									<DialogTitle>{description}</DialogTitle>
									<TextInput
										autoFocus
										type='text'
										id='name'
										name='name'
										ariaLabel='Name'
										defaultValue={client?.name}
										placeholder='First and Last Name'
									/>

									<TextInput
										autoFocus
										type='text'
										id='nitroxCert'
										name='nitroxCert'
										ariaLabel='Nitrox Certification'
										defaultValue={client?.nitroxCert}
										placeholder='Certification number to use <40% nitrox'
									/>

									<TextInput
										autoFocus
										type='text'
										id='advancedNitroxCert'
										name='advancedNitroxCert'
										defaultValue={client?.advancedNitroxCert}
										ariaLabel='Advanced Nitrox Certification'
										placeholder='Certification number to use up to 100% oxygen'
									/>

									<TextInput
										autoFocus
										type='text'
										id='trimixCert'
										name='trimixCert'
										defaultValue={client?.trimixCert}
										ariaLabel='Trimix Certification'
										placeholder='Certification number to helium in the breathing mix'
									/>

									<TextInput
										autoFocus
										type='text'
										id='inspectionCert'
										name='inspectionCert'
										defaultValue={client?.inspectionCert}
										ariaLabel='Visual Inspection Certification'
										placeholder='Certification number to perform visual inspections on tanks'
									/>

									{client && (
										<input type='hidden' name='id' value={client.id} />
									)}

									<div className='flex w-full justify-end gap-2'>
										<Button variant='ghost' onClick={handleClose}>
											{cancelText}
										</Button>
										<Button type='submit'>{submitText}</Button>
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

export default ClientModal

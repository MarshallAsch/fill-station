import { useAppSelector } from '@/redux/hooks'
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import TextInput from '../UI/FormElements/TextInput'
import { useQueryClient } from '@tanstack/react-query'
import RadioGroup from '../UI/FormElements/RadioGroup'
import {
	BOOL_OPTION_NO,
	BOOL_OPTION_YES,
	BOOL_OPTIONS,
	CYLINDER_MATERIAL_OPTIONS,
	SERVICE_PRESSURE,
} from '@/app/constants/FormConstants'
import ClientPicker from '../UI/FormElements/ClientPicker'
import DatePicker from '../UI/FormElements/DatePicker'
import Button from '../UI/Button'
import ListBox from '../UI/FormElements/ListBox'
import { newCylinder } from '@/app/_api'
import { Cylinder, NewCylinderDTO } from '@/types/cylinder'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

export type CylinderModalProps = {
	title?: string
	description?: string
	cancelText?: string
	submitText?: string
	cylinder?: Cylinder
	onSubmit?: (
		ownerId: number,
		cylinderId: number | undefined,
		cylinder: NewCylinderDTO,
	) => Promise<Cylinder | string>
	handleClose: () => void
}

const CylinderModal = ({
	title = 'New Cylinder',
	description = 'Add the new cylinders information to save it for next time.',
	submitText = 'Add',
	cancelText = 'Cancel',
	cylinder,
	handleClose,
	onSubmit = newCylinder,
}: CylinderModalProps) => {
	const queryClient = useQueryClient()

	const { allClients: clients, selectedClient } = useAppSelector(
		(state) => state.clients,
	)

	const handleSubmit = async (form: FormData) => {
		const formData = Object.fromEntries(
			form.entries(),
		) as unknown as NewCylinderDTO

		if (selectedClient) {
			const data = await onSubmit(
				selectedClient?.id,
				cylinder?.id,
				formData as NewCylinderDTO,
			)
			if (typeof data !== 'string') {
				toast.success('Saved new Cylinder')
				queryClient.invalidateQueries({ queryKey: ['cylinders'] })
				handleClose()
			} else {
				toast.error(`Failed to create cylinder: ${data}`)
			}
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

									<ClientPicker disableAdd={true} clients={clients} />

									<TextInput
										autoFocus
										type='text'
										id='serial-number'
										name='serialNumber'
										ariaLabel='Serial Number'
										defaultValue={cylinder?.serialNumber}
										placeholder='Serial Number'
									/>

									<div className='flex flex-row space-x-2'>
										<DatePicker
											name='birth'
											title='First Hydro'
											id='birth'
											defaultValue={dayjs(cylinder?.birth)}
										/>

										<DatePicker
											name='lastHydro'
											title='Last Hydro'
											id='last-hydro'
											defaultValue={dayjs(cylinder?.lastHydro)}
										/>
									</div>

									<DatePicker
										name='lastVis'
										title='Last Vis'
										id='last-vis'
										defaultValue={dayjs(cylinder?.lastVis)}
									/>

									<RadioGroup
										title='Cylinder material'
										name='material'
										options={CYLINDER_MATERIAL_OPTIONS}
										defaultValue={cylinder?.material}
									/>

									<ListBox
										items={SERVICE_PRESSURE}
										title='Rated service Pressure'
										name='servicePressure'
										id='fill_pressure'
										defaultValue={SERVICE_PRESSURE.find(
											(i) => i.value == cylinder?.servicePressure.toString(),
										)}
									/>

									<RadioGroup
										title='Tank and Valve have been cleaned for oxygen service to 100%'
										name='oxygenClean'
										options={BOOL_OPTIONS}
										defaultValue={
											cylinder?.oxygenClean == true
												? BOOL_OPTION_YES
												: BOOL_OPTION_NO
										}
									/>

									<div className='flex w-full justify-end gap-2'>
										<Button onClick={handleClose} variant='ghost'>
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

export default CylinderModal

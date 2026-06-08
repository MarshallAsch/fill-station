import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react'
import {
	CheckIcon,
	ChevronUpDownIcon,
	ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { updateFill } from '@/redux/fills/fillsSlice'
import { useAppDispatch } from '@/redux/hooks'
import { useState } from 'react'
import { Fill, FillType as IFillType } from '@/types/fills'
import { Client } from '@/types/client'
import { Cylinder } from '@/types/cylinder'
import Button from '../UI/Button'

type FillTypeProps = {
	index: number
	item: Fill
	client?: Client
	cylinder?: Cylinder
	pairedCylinder?: Cylinder
}

type FillOption = {
	value: IFillType
	label: string
	certified: boolean
	warning?: string
}

const FillType = ({
	index,
	item,
	client,
	cylinder,
	pairedCylinder,
}: FillTypeProps) => {
	const dispatch = useAppDispatch()

	const bothOxygenClean =
		cylinder?.oxygenClean == true &&
		(!pairedCylinder || pairedCylinder.oxygenClean == true)

	const nitroxUse =
		bothOxygenClean &&
		!!(client && (client.nitroxCert || client.advancedNitroxCert))
	const trimixUse = bothOxygenClean && !!(client && client.trimixCert)

	const options: FillOption[] = [
		{ value: 'air', label: 'Air', certified: true },
		{
			value: 'nitrox',
			label: 'Nitrox',
			certified: nitroxUse,
			warning: 'Client is not certified for nitrox',
		},
		{
			value: 'trimix',
			label: 'Trimix',
			certified: trimixUse,
			warning: 'Client is not certified for trimix',
		},
	]

	const [selectedFill, setSelectedFill] = useState<FillOption>(options[0])
	const [pendingOverride, setPendingOverride] = useState<FillOption | null>(
		null,
	)

	const applyChange = (option: FillOption) => {
		setSelectedFill(option)
		dispatch(
			updateFill({
				id: index,
				data: { ...item, type: option.value },
			}),
		)
	}

	const handleTypeChange = (option: FillOption) => {
		if (!option.certified) {
			setPendingOverride(option)
			return
		}
		applyChange(option)
	}

	const confirmOverride = () => {
		if (pendingOverride) applyChange(pendingOverride)
		setPendingOverride(null)
	}

	return (
		<div className=''>
			<Listbox value={selectedFill} onChange={handleTypeChange} by='value'>
				<Label className='text-text block text-sm/6 font-medium'>
					Assigned to
				</Label>
				<div className='relative mt-2'>
					<ListboxButton className='bg-background text-text outline-ring focus-visible:outline-accent grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:text-sm/6'>
						<span className='col-start-1 row-start-1 truncate pr-6'>
							{selectedFill.label}
						</span>
						<ChevronUpDownIcon
							aria-hidden='true'
							className='text-light-text col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4'
						/>
					</ListboxButton>

					<ListboxOptions
						transition
						className='bg-background absolute z-10 mt-1 max-h-60 w-40 overflow-auto rounded-md py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
					>
						{options.map((option) => (
							<ListboxOption
								key={option.value}
								value={option}
								title={option.certified ? undefined : option.warning}
								className='group data-focus:bg-accent data-focus:text-white-text relative cursor-default py-2 pr-9 pl-3'
							>
								<span className='flex items-center gap-2 truncate font-normal group-data-selected:font-semibold'>
									{!option.certified && (
										<ExclamationTriangleIcon
											aria-hidden='true'
											className='size-4 text-yellow-500'
										/>
									)}
									{option.label}
								</span>

								<span className='text-accent-text absolute inset-y-0 right-0 z-10 hidden items-center pr-4 group-data-selected:flex'>
									<CheckIcon aria-hidden='true' className='size-5' />
								</span>
							</ListboxOption>
						))}
					</ListboxOptions>
				</div>
			</Listbox>

			<Dialog
				open={pendingOverride !== null}
				onClose={() => setPendingOverride(null)}
				className='relative z-50'
			>
				<div className='fixed inset-0 bg-black/30' aria-hidden='true' />
				<div className='fixed inset-0 flex items-center justify-center p-4'>
					<DialogPanel className='bg-background border-border w-full max-w-md rounded-lg border p-6 shadow-xl'>
						<div className='flex items-start gap-3'>
							<ExclamationTriangleIcon
								aria-hidden='true'
								className='size-6 shrink-0 text-yellow-500'
							/>
							<div className='flex-1'>
								<DialogTitle className='text-text text-base font-semibold'>
									Override cert requirement?
								</DialogTitle>
								<p className='text-light-text mt-2 text-sm'>
									{pendingOverride?.warning}. Only continue if this cylinder is
									being borrowed by a certified diver.
								</p>
							</div>
						</div>
						<div className='mt-6 flex justify-end gap-2'>
							<Button variant='ghost' onClick={() => setPendingOverride(null)}>
								Cancel
							</Button>
							<Button onClick={confirmOverride}>Override</Button>
						</div>
					</DialogPanel>
				</div>
			</Dialog>
		</div>
	)
}

export default FillType

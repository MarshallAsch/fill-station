import {
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { updateFill } from '@/redux/fills/fillsSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useState } from 'react'
import { Fill, FillType as IFillType } from '@/types/fills'

type FillTypeProps = {
	index: number
	item: Fill
}

type FillOption = {
	value: IFillType
	label: string
	enabled: boolean
	disabledReason?: string
}

const FillType = ({ index, item }: FillTypeProps) => {
	const client = useAppSelector((state) => state.clients.selectedClient)
	const dispatch = useAppDispatch()

	const nitroxUse = !!(
		client &&
		(client.nitroxCert || client.advancedNitroxCert)
	)
	const trimixUse = !!(client && client.trimixCert)

	const options: FillOption[] = [
		{ value: 'air', label: 'Air', enabled: true },
		{
			value: 'nitrox',
			label: 'Nitrox',
			enabled: nitroxUse,
			disabledReason: 'Not certified for nitrox',
		},
		{
			value: 'trimix',
			label: 'Trimix',
			enabled: trimixUse,
			disabledReason: 'Not certified for trimix',
		},
	]

	const handleTypeChange = (option: FillOption) => {
		setSelectedFill(option)
		dispatch(
			updateFill({
				id: index,
				data: { ...item, type: option.value },
			}),
		)
	}

	const [selectedFill, setSelectedFill] = useState<FillOption>(options[0])

	return (
		<div className='px-3 py-2'>
			<Listbox value={selectedFill} onChange={handleTypeChange} by='value'>
				<Label className='block text-sm/6 font-medium text-gray-900'>
					Assigned to
				</Label>
				<div className='relative mt-2'>
					<ListboxButton className='grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6'>
						<span className='col-start-1 row-start-1 truncate pr-6'>
							{selectedFill.label}
						</span>
						<ChevronUpDownIcon
							aria-hidden='true'
							className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4'
						/>
					</ListboxButton>

					<ListboxOptions
						transition
						className='absolute z-10 mt-1 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
					>
						{options.map((option) => (
							<ListboxOption
								key={option.value}
								value={option}
								disabled={!option.enabled}
								title={option.enabled ? undefined : option.disabledReason}
								className='group relative cursor-default py-2 pr-9 pl-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-indigo-600 data-focus:text-white'
							>
								<span className='block truncate font-normal group-data-selected:font-semibold'>
									{option.label}
								</span>

								<span className='absolute inset-y-0 right-0 z-10 hidden items-center pr-4 text-indigo-600 group-data-selected:flex'>
									<CheckIcon aria-hidden='true' className='size-5' />
								</span>
							</ListboxOption>
						))}
					</ListboxOptions>
				</div>
			</Listbox>
		</div>
	)
}

export default FillType

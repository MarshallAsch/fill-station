import {
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { updateFill } from '@/redux/fills/fillsSlice'
import { useAppDispatch } from '@/redux/hooks'
import { useState } from 'react'
import { Fill, FillType as IFillType } from '@/types/fills'
import { Client } from '@/types/client'
import { Cylinder } from '@/types/cylinder'

type FillTypeProps = {
	index: number
	item: Fill
	client?: Client
	cylinder?: Cylinder
}

type FillOption = {
	value: IFillType
	label: string
	enabled: boolean
	disabledReason?: string
}

const FillType = ({ index, item, client, cylinder }: FillTypeProps) => {
	const dispatch = useAppDispatch()

	const nitroxUse =
		cylinder?.oxygenClean == true &&
		!!(client && (client.nitroxCert || client.advancedNitroxCert))
	const trimixUse =
		cylinder?.oxygenClean == true && !!(client && client.trimixCert)

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
								disabled={!option.enabled}
								title={option.enabled ? undefined : option.disabledReason}
								className='group data-focus:bg-accent data-focus:text-white-text relative cursor-default py-2 pr-9 pl-3 data-disabled:cursor-not-allowed data-disabled:opacity-50'
							>
								<span className='block truncate font-normal group-data-selected:font-semibold'>
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
		</div>
	)
}

export default FillType

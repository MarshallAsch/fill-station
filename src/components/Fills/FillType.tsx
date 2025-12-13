import {
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Fill, updateFill } from '@/redux/fills/fillsSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'

type FillType = 'air' | 'nitrox' | 'trimix'

type FillTypeProps = {
	index: number
	item: Fill
}

const FillType = ({ index, item }: FillTypeProps) => {
	const client = useAppSelector((state) => state.clients.selectedClient)
	const dispatch = useAppDispatch()
	const nitroxUse = !!(
		client &&
		(client.nitroxCert || client.advancedNitroxCert)
	)
	const trimixUse = !!(client && client.trimixCert)

	const options: {
		value: FillType
		label: string
		enabled: boolean
		disabledReason?: string
	}[] = [
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

	const handleTypeChange = (value: FillType) => {
		dispatch(
			updateFill({
				id: index,
				data: { ...item, type: value },
			}),
		)
	}
	return (
		<td className='px-3 py-2'>
			<Listbox value={item.type} onChange={handleTypeChange}>
				<div className='relative'>
					<Label className='mb-1 block text-sm font-medium text-gray-700'>
						Fill Type
					</Label>

					<ListboxButton className='relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm'>
						<span className='block truncate'>
							{options.find((o) => o.value === item.type)?.label}
						</span>
						<span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
							<ChevronUpDownIcon className='h-5 w-5 text-gray-400' />
						</span>
					</ListboxButton>

					<ListboxOptions className='ring-opacity-5 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm'>
						{options.map((option) => (
							<ListboxOption
								key={option.value}
								value={option.value}
								disabled={!option.enabled}
								title={!option.enabled ? option.disabledReason : undefined}
								className={({ active, disabled }) =>
									`relative cursor-default py-2 pr-4 pl-10 select-none ${active && !disabled ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `
								}
							>
								{({ selected }) => (
									<>
										<span
											className={`block truncate ${
												selected ? 'font-medium' : 'font-normal'
											}`}
										>
											{option.label}
										</span>

										{selected && (
											<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600'>
												<CheckIcon className='h-5 w-5' />
											</span>
										)}
									</>
								)}
							</ListboxOption>
						))}
					</ListboxOptions>
				</div>
			</Listbox>
		</td>
	)
}

export default FillType

import {
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

type Item = {
	id?: number
	value: string
	name: string
}

type ListBoxProps = {
	items: Item[]
	title: string
	id: string
	name: string
	defaultValue?: Item
	onChange?: (item: Item) => void
}

const ListBox = ({
	items,
	title,
	id,
	name,
	defaultValue,
	onChange,
}: ListBoxProps) => {
	const [selected, setSelected] = useState<Item | undefined>(
		defaultValue || items[0],
	)

	const handleChange = (item: Item) => {
		setSelected(item)
		onChange?.(item)
	}

	return (
		<Listbox value={selected} onChange={handleChange}>
			<Label className='block text-sm/6 font-medium text-gray-900 dark:text-gray-100'>
				{title}
			</Label>
			<div className=''>
				<ListboxButton className='bg-background grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-gray-800 dark:text-gray-100 dark:outline-gray-600'>
					<span className='col-start-1 row-start-1 flex w-full gap-2 pr-6'>
						<span className='truncate'>{selected?.name}</span>
					</span>
					<ChevronUpDownIcon
						aria-hidden='true'
						className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400'
					/>
				</ListboxButton>

				<ListboxOptions
					transition
					className='bg-background absolute z-60 mt-1 max-h-60 w-full max-w-100 overflow-auto rounded-md py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm dark:bg-gray-800 dark:outline-gray-700'
				>
					{items.map((item, index) => (
						<ListboxOption
							key={item.id || index}
							value={item}
							className='group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden dark:text-gray-100'
						>
							<div className='flex'>
								<span className='truncate font-normal group-data-selected:font-semibold'>
									{item.name}
								</span>
							</div>

							<span className='absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white'>
								<CheckIcon aria-hidden='true' className='size-5' />
							</span>
						</ListboxOption>
					))}
				</ListboxOptions>
			</div>
			{/* This allows the input to be collected when the form is submitted */}
			<input id={id} type='hidden' name={name} value={selected?.value} />
		</Listbox>
	)
}

export default ListBox

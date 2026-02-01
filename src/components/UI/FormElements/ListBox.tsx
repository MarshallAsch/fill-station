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
	id: number
	value: string
	name: string
}

type ListBoxProps = {
	items: Item[]
	title: string
	id: string
	name: string
}

const ListBox = ({ items, title, id, name }: ListBoxProps) => {
	const [selected, setSelected] = useState<Item | null>(items[1])

	return (
		<Listbox value={selected} onChange={setSelected}>
			<Label className='block text-sm/6 font-medium text-gray-900'>
				{title}
			</Label>
			<div className=''>
				<ListboxButton className='grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6'>
					<span className='col-start-1 row-start-1 flex w-full gap-2 pr-6'>
						<span className='truncate'>{selected?.name}</span>
					</span>
					<ChevronUpDownIcon
						aria-hidden='true'
						className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4'
					/>
				</ListboxButton>

				<ListboxOptions
					transition
					className='absolute z-60 mt-1 max-h-60 w-full max-w-100 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
				>
					{items.map((item) => (
						<ListboxOption
							key={item.id}
							value={item}
							className='group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
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

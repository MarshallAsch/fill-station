'use client'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Cylinder } from '@/redux/cylinder/cylinderSlice'
import {
	Button,
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Label,
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { updateAddCylinderModalOpen } from '@/redux/modal/modalSlice'
import { updateCylinder } from '@/redux/fills/fillsSlice'
type CylinderPickerProps = {
	isFill?: boolean
	index?: number
}
const CylinderPicker = ({ isFill, index }: CylinderPickerProps) => {
	const cylinders = useAppSelector((state) => state.cylinders)
	const dispatch = useAppDispatch()

	const [query, setQuery] = useState('')
	const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(
		null,
	)

	const filteredCylinders =
		query === ''
			? cylinders
			: cylinders.filter((cylinder) => {
					return cylinder.serialNumber
						.toLowerCase()
						.includes(query.toLowerCase())
				})

	useEffect(() => {
		if (isFill && index !== undefined && selectedCylinder) {
			dispatch(updateCylinder({ id: index, data: selectedCylinder }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCylinder, dispatch])

	return (
		<Combobox
			as='div'
			value={selectedCylinder}
			onChange={(cylinder) => {
				setQuery('')
				setSelectedCylinder(cylinder)
			}}
		>
			<Label className='block text-sm/6 font-medium text-gray-900'>
				Select a Cylinder
			</Label>

			<div className='relative mt-2'>
				<ComboboxInput
					className='block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
					name='cylinder'
					onChange={(e) => setQuery(e.target.value)}
					displayValue={(cylinder: Cylinder) =>
						cylinder && cylinder.serialNumber
					}
				/>

				<ComboboxButton className='absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2 focus:outline-hidden'>
					<ChevronDownIcon
						className='h-5 w-5 text-gray-400'
						aria-hidden='true'
					/>
				</ComboboxButton>

				<ComboboxOptions
					transition
					className='absolute z-10 mt-1 max-h-60 w-75 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
				>
					<Button
						onClick={() => dispatch(updateAddCylinderModalOpen(true))}
						className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
					>
						Add new Cylinder
					</Button>
					{query.length > 0 && (
						<ComboboxOption
							value={{ id: null, name: query }}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
						>
							{query}
						</ComboboxOption>
					)}
					{filteredCylinders.map((cylinder) => (
						<ComboboxOption
							key={cylinder.serialNumber}
							value={cylinder}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
						>
							{cylinder.serialNumber}
						</ComboboxOption>
					))}
				</ComboboxOptions>
			</div>
		</Combobox>
	)
}

export default CylinderPicker

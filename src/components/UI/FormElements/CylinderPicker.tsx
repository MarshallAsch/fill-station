'use client'

import { useAppDispatch } from '@/redux/hooks'
import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Label,
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'

import {
	updateAddCylinderModalOpen,
	updateEditCylinderModal,
} from '@/redux/modal/modalSlice'
import { updateCylinder } from '@/redux/fills/fillsSlice'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Cylinder } from '@/types/cylinder'
import Button from '../Button'
import Tooltip from '../Tooltip'
import useLoadCylinder from '@/hooks/useLoadCylinders'

dayjs.extend(duration)

type CylinderPickerProps = {
	isFill?: boolean
	index?: number
	disableAdd?: boolean
	showExpired?: boolean
	initialValue?: Cylinder
	filter?: (c: Cylinder) => boolean
	onChange?: (c?: Cylinder) => void
	visPage?: boolean
}

const CylinderPicker = ({
	isFill,
	index,
	disableAdd,
	showExpired = false,
	filter,
	initialValue,
	onChange,
	visPage,
}: CylinderPickerProps) => {
	const { cylinders } = useLoadCylinder()
	const dispatch = useAppDispatch()

	const [query, setQuery] = useState('')
	const [selectedCylinder, setSelectedCylinder] = useState<
		Cylinder | null | undefined
	>(initialValue)

	const filteredCylinders =
		query === ''
			? cylinders
			: cylinders.filter((cylinder) => {
					const q = query.toLowerCase()
					return (
						cylinder.serialNumber.toLowerCase().includes(q) ||
						(cylinder.nickname?.toLowerCase().includes(q) ?? false)
					)
				})

	const formatCylinderLabel = (cylinder: Cylinder) =>
		cylinder.nickname
			? `${cylinder.nickname} (${cylinder.serialNumber})`
			: cylinder.serialNumber

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
				if (cylinder) {
					if (!cylinder.verified) {
						dispatch(updateEditCylinderModal(cylinder))
					}
					onChange && onChange(cylinder)
				}
			}}
			className='w-1/2'
		>
			<Label className='text-text block text-sm/6 font-medium'>
				Select a Cylinder
			</Label>

			<div className='relative mt-2'>
				<ComboboxInput
					className='bg-background text-text outline-ring placeholder:text-muted-text focus:outline-accent block w-full rounded-md py-1.5 pr-12 pl-3 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6'
					name='cylinder'
					onChange={(e) => setQuery(e.target.value)}
					displayValue={(cylinder: Cylinder) =>
						cylinder ? formatCylinderLabel(cylinder) : ''
					}
				/>

				<ComboboxButton className='absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2 focus:outline-hidden'>
					<ChevronDownIcon
						className='text-muted-text h-5 w-5'
						aria-hidden='true'
					/>
				</ComboboxButton>

				<ComboboxOptions
					transition
					className='bg-background absolute z-10 mt-1 max-h-60 w-75 overflow-auto rounded-md py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
				>
					<div className='m-2 w-40'>
						<Button
							onClick={() =>
								dispatch(updateAddCylinderModalOpen({ open: true }))
							}
							disabled={disableAdd}
						>
							Add new Cylinder
						</Button>
					</div>
					{query.length > 0 && (
						<ComboboxOption
							value={{ id: null, name: query }}
							hidden={disableAdd}
							disabled={true}
							className='text-text data-focus:bg-accent data-focus:text-white-text cursor-pointer px-3 py-2 select-none data-focus:outline-hidden'
						>
							{query}
						</ComboboxOption>
					)}
					{filter &&
						filteredCylinders.filter(filter).map((cylinder) => {
							const needsHydro =
								dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() > 5
							const needsVis = visPage
								? false
								: dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() > 12

							return (
								<ComboboxOption
									key={cylinder.serialNumber}
									value={cylinder}
									disabled={needsHydro || needsVis}
									className='text-text data-disabled:text-disabled data-focus:bg-accent data-focus:text-white-text flex cursor-pointer justify-between gap-2 px-3 py-2 select-none data-focus:outline-hidden'
								>
									<span className='flex items-center gap-1'>
										{!cylinder.verified && (
											<Tooltip
												position='right'
												message='User entered details, requires verification'
											>
												<ExclamationTriangleIcon className='size-5 fill-yellow-500' />
											</Tooltip>
										)}
										{formatCylinderLabel(cylinder)}
									</span>
									{(needsHydro || needsVis) && (
										<Tooltip
											position='left'
											message={`Needs ${needsHydro ? 'Hydro' : 'Visual'}`}
										>
											<ExclamationTriangleIcon
												className={`size-5 ${needsHydro ? 'fill-red-600' : !showExpired ? 'fill-yellow-500' : 'fill-amber-500'} `}
											/>
										</Tooltip>
									)}
								</ComboboxOption>
							)
						})}
				</ComboboxOptions>
			</div>
		</Combobox>
	)
}

export default CylinderPicker

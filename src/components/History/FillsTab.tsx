'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { FillHistory } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'
import FillHistoryTable from '@/components/History/components/FillHistoryTable'
import TableToolbar, { FilterChip } from '@/components/UI/TableToolbar'
import ListBox from '@/components/UI/FormElements/ListBox'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import CylinderPicker from '@/components/UI/FormElements/CylinderPicker'
import useLoadFills from '@/hooks/useLoadFills'
import useTableFilters from '@/hooks/useTableFilters'
import { getFillCategory, FillMixCategory } from '@/lib/fills'
import {
	FILL_SORT_OPTIONS,
	MIX_TYPE_OPTIONS,
} from '@/app/constants/FormConstants'

type MixFilter = 'any' | FillMixCategory

const sortByValue: Record<string, (a: FillHistory, b: FillHistory) => number> =
	{
		'date-desc': (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
		'date-asc': (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
		'mix-asc': (a, b) => getFillCategory(a).localeCompare(getFillCategory(b)),
	}

const mixItem = (mix: MixFilter) =>
	MIX_TYPE_OPTIONS.find((o) => o.value === mix) ?? MIX_TYPE_OPTIONS[0]

const FillsTab = () => {
	const { fills } = useLoadFills()
	const [mix, setMix] = useState<MixFilter>('any')
	const [cylinder, setCylinder] = useState<Cylinder | null>(null)
	const [owner, setOwner] = useState<Client | null>(null)
	const [sortValue, setSortValue] = useState<string>('date-desc')

	const predicates = useMemo(() => {
		const list: Array<(f: FillHistory) => boolean> = []
		if (mix !== 'any') {
			list.push((f) => getFillCategory(f) === mix)
		}
		if (cylinder) {
			list.push((f) => f.Cylinder.id === cylinder.id)
		}
		if (owner) {
			list.push((f) => f.Cylinder.Client?.id === owner.id)
		}
		return list
	}, [mix, cylinder, owner])

	const sort = sortByValue[sortValue]
	const filtered = useTableFilters(fills, { predicates, sort })

	const chips: FilterChip[] = []
	if (mix !== 'any')
		chips.push({
			label: `Mix: ${mix[0].toUpperCase()}${mix.slice(1)}`,
			onClear: () => setMix('any'),
		})
	if (cylinder)
		chips.push({
			label: `Cylinder: ${cylinder.nickname ?? cylinder.serialNumber}`,
			onClear: () => setCylinder(null),
		})
	if (owner)
		chips.push({
			label: `Owner: ${owner.name}`,
			onClear: () => setOwner(null),
		})

	const clearAll = () => {
		setMix('any')
		setCylinder(null)
		setOwner(null)
	}

	return (
		<div className='w-full'>
			<TableToolbar
				filters={
					<>
						<div className='w-40'>
							<ListBox
								items={MIX_TYPE_OPTIONS}
								title='Mix type'
								id='filter-mix'
								name='filter-mix'
								value={mixItem(mix)}
								onChange={(item) => setMix(item.value as MixFilter)}
							/>
						</div>
						<div className='w-60'>
							<CylinderPicker
								value={cylinder}
								onChange={(c) => setCylinder(c ?? null)}
							/>
						</div>
						<div className='w-60'>
							<ClientPicker disableAdd value={owner} onChange={setOwner} />
						</div>
					</>
				}
				sort={
					<div className='w-60'>
						<ListBox
							items={FILL_SORT_OPTIONS}
							title='Sort by'
							id='fill-sort'
							name='fill-sort'
							value={
								FILL_SORT_OPTIONS.find((o) => o.value === sortValue) ??
								FILL_SORT_OPTIONS[0]
							}
							onChange={(item) => setSortValue(item.value)}
						/>
					</div>
				}
				chips={chips}
				onClearAll={chips.length > 0 ? clearAll : undefined}
			/>
			<FillHistoryTable fills={filtered} />
		</div>
	)
}

export default FillsTab

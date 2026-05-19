'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import TableToolbar, { FilterChip } from '@/components/UI/TableToolbar'
import ListBox from '@/components/UI/FormElements/ListBox'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import useTableFilters from '@/hooks/useTableFilters'
import {
	CYLINDER_SORT_OPTIONS,
	YES_NO_ANY_OPTIONS,
} from '@/app/constants/FormConstants'

type CylindersTabProps = {
	cylinders: Cylinder[]
}

type TriState = 'any' | 'yes' | 'no'

const matchTri = (state: TriState, actual: boolean): boolean => {
	if (state === 'any') return true
	return state === 'yes' ? actual : !actual
}

const sortByValue: Record<string, (a: Cylinder, b: Cylinder) => number> = {
	'serial-asc': (a, b) =>
		(a.nickname ?? a.serialNumber).localeCompare(b.nickname ?? b.serialNumber),
	'lastVis-asc': (a, b) =>
		dayjs(a.lastVis).valueOf() - dayjs(b.lastVis).valueOf(),
	'lastVis-desc': (a, b) =>
		dayjs(b.lastVis).valueOf() - dayjs(a.lastVis).valueOf(),
	'lastHydro-asc': (a, b) =>
		dayjs(a.lastHydro).valueOf() - dayjs(b.lastHydro).valueOf(),
	'lastHydro-desc': (a, b) =>
		dayjs(b.lastHydro).valueOf() - dayjs(a.lastHydro).valueOf(),
}

const triItem = (state: TriState) =>
	YES_NO_ANY_OPTIONS.find((o) => o.value === state) ?? YES_NO_ANY_OPTIONS[0]

const CylindersTab = ({ cylinders }: CylindersTabProps) => {
	const [oxygen, setOxygen] = useState<TriState>('any')
	const [needsVis, setNeedsVis] = useState<TriState>('any')
	const [outOfHydro, setOutOfHydro] = useState<TriState>('any')
	const [owner, setOwner] = useState<Client | null>(null)
	const [sortValue, setSortValue] = useState<string>('serial-asc')

	const predicates = useMemo(() => {
		const now = dayjs()
		const list: Array<(c: Cylinder) => boolean> = []
		if (oxygen !== 'any') {
			list.push((c) => matchTri(oxygen, c.oxygenClean))
		}
		if (needsVis !== 'any') {
			list.push((c) =>
				matchTri(needsVis, dayjs(c.lastVis).add(1, 'year').isBefore(now)),
			)
		}
		if (outOfHydro !== 'any') {
			list.push((c) =>
				matchTri(outOfHydro, dayjs(c.lastHydro).add(5, 'year').isBefore(now)),
			)
		}
		if (owner) {
			list.push((c) => c.ownerId === owner.id)
		}
		return list
	}, [oxygen, needsVis, outOfHydro, owner])

	const sort = sortByValue[sortValue]
	const filtered = useTableFilters(cylinders, { predicates, sort })

	const chips: FilterChip[] = []
	if (oxygen !== 'any')
		chips.push({
			label: `Oxygen clean: ${oxygen === 'yes' ? 'Yes' : 'No'}`,
			onClear: () => setOxygen('any'),
		})
	if (needsVis !== 'any')
		chips.push({
			label: needsVis === 'yes' ? 'Needs vis' : 'Vis current',
			onClear: () => setNeedsVis('any'),
		})
	if (outOfHydro !== 'any')
		chips.push({
			label: outOfHydro === 'yes' ? 'Out of hydro' : 'Hydro current',
			onClear: () => setOutOfHydro('any'),
		})
	if (owner)
		chips.push({ label: `Owner: ${owner.name}`, onClear: () => setOwner(null) })

	const clearAll = () => {
		setOxygen('any')
		setNeedsVis('any')
		setOutOfHydro('any')
		setOwner(null)
	}

	return (
		<div className='w-full'>
			<TableToolbar
				filters={
					<>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Oxygen clean'
								id='filter-oxygen'
								name='filter-oxygen'
								value={triItem(oxygen)}
								onChange={(item) => setOxygen(item.value as TriState)}
							/>
						</div>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Needs vis'
								id='filter-needs-vis'
								name='filter-needs-vis'
								value={triItem(needsVis)}
								onChange={(item) => setNeedsVis(item.value as TriState)}
							/>
						</div>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Out of hydro'
								id='filter-out-hydro'
								name='filter-out-hydro'
								value={triItem(outOfHydro)}
								onChange={(item) => setOutOfHydro(item.value as TriState)}
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
							items={CYLINDER_SORT_OPTIONS}
							title='Sort by'
							id='cylinder-sort'
							name='cylinder-sort'
							value={
								CYLINDER_SORT_OPTIONS.find((o) => o.value === sortValue) ??
								CYLINDER_SORT_OPTIONS[0]
							}
							onChange={(item) => setSortValue(item.value)}
						/>
					</div>
				}
				chips={chips}
				onClearAll={chips.length > 0 ? clearAll : undefined}
			/>
			<CylinderListTable cylinders={filtered} showOwner />
		</div>
	)
}

export default CylindersTab

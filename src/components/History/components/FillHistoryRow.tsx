import { FillHistory } from '@/types/fills'
import { getFillMix } from '@/lib/fills'
import dayjs from 'dayjs'
import Tooltip from '@/components/UI/Tooltip'

const FillHistoryRow = ({ fill }: { fill: FillHistory }) => {
	const ownerName = fill.Cylinder.Client?.name
	const cylinderCell = fill.Cylinder.nickname ? (
		<div className='flex flex-col items-center'>
			<span>{fill.Cylinder.nickname}</span>
			<span className='text-light-text text-xs'>
				{fill.Cylinder.serialNumber}
			</span>
		</div>
	) : (
		<span>{fill.Cylinder.serialNumber}</span>
	)

	return (
		<tr key={fill.id} className='hover:bg-hover'>
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{dayjs(fill.date).format('MMM D, YYYY')}
			</td>

			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{getFillMix(fill)}
			</td>
			<td className='text-light-text hidden px-3 py-4 text-center text-sm whitespace-nowrap sm:table-cell'>
				{fill.startPressure}
			</td>
			<td className='text-light-text hidden px-3 py-4 text-center text-sm whitespace-nowrap sm:table-cell'>
				{fill.endPressure}
			</td>
			<td className='py-4 pr-4 pl-3 text-center text-sm font-medium whitespace-nowrap sm:pr-6'>
				{ownerName ? (
					<Tooltip message={`Owner: ${ownerName}`}>{cylinderCell}</Tooltip>
				) : (
					cylinderCell
				)}
			</td>
		</tr>
	)
}

export default FillHistoryRow

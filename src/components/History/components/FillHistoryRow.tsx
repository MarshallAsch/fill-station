import { FillHistory } from '@/types/fills'
import dayjs from 'dayjs'

function getFillMix(fill: FillHistory): string {
	if (fill.helium != 0) {
		return `${fill.oxygen}/${fill.helium}`
	} else if (fill.oxygen == 20.9) {
		return 'air'
	} else {
		return `EAN ${fill.oxygen}`
	}
}
const FillHistoryRow = ({ fill }: { fill: FillHistory }) => {
	return (
		<tr key={fill.id} className='hover:bg-hover'>
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{dayjs(fill.date).format('MMM D, YYYY')}
			</td>

			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{getFillMix(fill)}
			</td>
			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{fill.startPressure}
			</td>
			<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
				{fill.endPressure}
			</td>
			<td className='py-4 pr-4 pl-3 text-center text-sm font-medium whitespace-nowrap sm:pr-6'>
				{fill.Cylinder.serialNumber}
			</td>
		</tr>
	)
}

export default FillHistoryRow

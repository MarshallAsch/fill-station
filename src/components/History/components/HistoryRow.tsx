import { FillHistory } from '@/redux/history/historySlice'

const HistoryRow = ({ fill }: { fill: FillHistory }) => {
	return (
		<tr key={fill.id} className='hover:bg-gray-100'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{fill.date}
			</td>

			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{fill.oxygen}/{fill.helium}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{fill.startPressure}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				{fill.endPressure}
			</td>
			<td className='py-4 pr-4 pl-3 text-center text-sm font-medium whitespace-nowrap sm:pr-6'>
				{fill.Cylinder.serialNumber}
			</td>
		</tr>
	)
}

export default HistoryRow

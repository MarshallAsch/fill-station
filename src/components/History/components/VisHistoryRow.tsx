import { VisualHistory } from '@/types/visuals'
import {
	CheckCircleIcon,
	LinkIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import Link from 'next/link'

const VisHistoryRow = ({
	visual,
	hideDetails = false,
}: {
	visual: VisualHistory
	hideDetails?: boolean
}) => {
	return (
		<tr key={visual.id} className='hover:bg-hover'>
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{dayjs(visual.date).format('MMM D, YYYY')}
			</td>
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{visual.Cylinder?.serialNumber}
			</td>
			<td className='text-light-text items-center px-3 py-4 text-sm whitespace-nowrap'>
				<span className='flex w-full justify-center'>
					{visual.status == 'acceptable' ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			<td className='text-light-text px-3 py-4 text-sm whitespace-nowrap'>
				<span className='flex w-full justify-center'>
					{visual.markedOxygenClean ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			{!hideDetails && (
				<td className='text-light-text px-3 py-4 text-center text-sm whitespace-nowrap'>
					<Link href={`/visual/${visual.id}`}>
						<LinkIcon className='h-5' />
					</Link>
				</td>
			)}
		</tr>
	)
}

export default VisHistoryRow

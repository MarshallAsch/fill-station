import { Cylinder } from '@/redux/cylinder/cylinderSlice'
import {
	CheckCircleIcon,
	LinkIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const VisHistoryRow = ({ cylinder }: { cylinder: Cylinder }) => {
	return (
		<tr key={cylinder.serialNumber} className='hover:bg-gray-100'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{cylinder.lastVis!.date}
			</td>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{cylinder.serialNumber}
			</td>
			<td className='items-center px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
				<span className='flex w-full justify-center'>
					{cylinder.lastVis?.passed ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
				<span className='flex w-full justify-center'>
					{cylinder.lastVis?.oxygenClean ? (
						<CheckCircleIcon className='h-10' />
					) : (
						<XCircleIcon className='h-10' />
					)}
				</span>
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				<Link href={`/visual/${cylinder.lastVis?.details}`}>
					<LinkIcon className='h-5' />
				</Link>
			</td>
		</tr>
	)
}

export default VisHistoryRow

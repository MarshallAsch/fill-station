import { Client } from '@/types/client'
import { LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const clientCert = (client: Client) => {
	let highest = ''

	if (client.trimixCert != '') {
		highest = 'Trimix'
	} else if (client.advancedNitroxCert != '') {
		highest = 'Nitrox < 100%'
	} else if (client.nitroxCert != '') {
		highest = 'Nitrox < 40%'
	} else {
		highest = 'Air only'
	}

	return highest
}

const ClientsRow = ({ client }: { client: Client }) => {
	return (
		<tr key={client.id} className='hover:bg-gray-100'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{client.name}
			</td>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6'>
				{clientCert(client)}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
				<Link href={`/clients/${client.id}`}>
					<LinkIcon className='h-5' />
				</Link>
			</td>
		</tr>
	)
}

export default ClientsRow

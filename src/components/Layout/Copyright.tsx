import * as React from 'react'
import Link from 'next/link'

export default function Copyright() {
	return (
		<div className='my-2 flex w-full justify-center text-sm dark:text-gray-400'>
			{'Copyright © '}
			<Link className='underline' href='https://marshallasch.ca/'>
				Marshall Asch
			</Link>
			,
			<Link className='underline' href='https://kellenwiltshire.com/'>
				Kellen Wiltshire
			</Link>{' '}
			{new Date().getFullYear()}.
		</div>
	)
}

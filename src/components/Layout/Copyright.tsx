import * as React from 'react'
import Link from 'next/link'

export default function Copyright() {
	return (
		<div className='my-2 flex w-full justify-center text-sm'>
			{'Copyright © '}
			<Link className='underline' href='https://marshallasch.ca/'>
				Marshall Asch
			</Link>{' '}
			{new Date().getFullYear()}.
		</div>
	)
}

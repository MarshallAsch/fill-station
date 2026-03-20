import React from 'react'

import SendTestEmailButton from './SendTestEmailButton'

type SmtpConfig = {
	host: string | undefined
	port: number | undefined
	from: string | undefined
	shopEmail: string | undefined
}

const NotificationsTab = ({ smtp }: { smtp: SmtpConfig }) => {
	const isConfigured = !!smtp.host

	const rows = [
		{ label: 'SMTP Host', value: smtp.host },
		{ label: 'SMTP Port', value: smtp.port?.toString() },
		{ label: 'From Address', value: smtp.from },
		{ label: 'Shop Email', value: smtp.shopEmail },
	]

	return (
		<div className='w-full max-w-2xl'>
			<h2 className='text-text text-xl font-semibold'>Email Configuration</h2>
			<p className='text-muted-text mt-1 text-sm'>
				Read-only — configured via environment variables
			</p>

			<div className='mt-6 grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-sm'>
				{rows.map((row) => (
					<React.Fragment key={row.label}>
						<div className='text-muted-text'>{row.label}</div>
						<div className='bg-surface text-text rounded px-2 py-1 font-mono'>
							{row.value ?? '—'}
						</div>
					</React.Fragment>
				))}

				<div className='text-muted-text'>Status</div>
				<div className='flex items-center gap-2'>
					<div
						className={`size-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}
					/>
					<span
						className={`text-sm ${isConfigured ? 'text-green-500' : 'text-red-500'}`}
					>
						{isConfigured ? 'Configured' : 'Not configured'}
					</span>
				</div>
			</div>

			<div className='mt-6'>
				<SendTestEmailButton disabled={!isConfigured} />
			</div>
		</div>
	)
}

export default NotificationsTab

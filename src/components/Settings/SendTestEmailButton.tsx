'use client'

import Button from '@/components/UI/Button'
import axios from 'axios'
import { useState } from 'react'
import { toast } from 'react-toastify'

const SendTestEmailButton = ({ disabled }: { disabled?: boolean }) => {
	const [sending, setSending] = useState(false)

	const handleSend = async () => {
		setSending(true)
		try {
			const res = await axios.post('/api/settings/test-email')
			if (res.status === 200) {
				toast.success('Test email sent — check your inbox')
			} else {
				toast.error(res.data?.message ?? 'Failed to send test email')
			}
		} catch {
			toast.error('Failed to send test email')
		} finally {
			setSending(false)
		}
	}

	return (
		<Button onClick={handleSend} disabled={disabled || sending}>
			{sending ? 'Sending...' : 'Send Test Email'}
		</Button>
	)
}

export default SendTestEmailButton

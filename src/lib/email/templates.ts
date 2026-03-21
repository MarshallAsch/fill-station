export function welcomeEmail(
	userName: string,
	baseUrl?: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Welcome to Fill Station</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Your account has been created. You can now track your cylinder fills, visual inspections, and hydro tests.
	</p>
${emailFooter(baseUrl)}
</body>
</html>`
}

export function contactNotificationEmail(
	contactName: string,
	contactEmail: string,
	message: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">New Contact Form Submission</h1>
	<p style="color: #333; font-size: 16px;"><strong>From:</strong> ${escapeHtml(contactName)} (${escapeHtml(contactEmail)})</p>
	<div style="background: #f5f5f5; border-left: 4px solid #0070f3; padding: 12px 16px; margin: 16px 0;">
		<p style="color: #333; font-size: 16px; white-space: pre-wrap;">${escapeHtml(message)}</p>
	</div>
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
</body>
</html>`
}

export function hydroReminderEmail(
	userName: string,
	cylinderSerial: string,
	dueDate: string,
	baseUrl?: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Hydro Test Due Soon</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Cylinder <strong>${escapeHtml(cylinderSerial)}</strong> has a hydro test due on <strong>${escapeHtml(dueDate)}</strong>.
	</p>
	<p style="color: #333; font-size: 16px;">
		Please contact the shop to schedule your hydrostatic test.
	</p>
${emailFooter(baseUrl)}
</body>
</html>`
}

export function visualReminderEmail(
	userName: string,
	cylinderSerial: string,
	dueDate: string,
	baseUrl?: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Visual Inspection Due Soon</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Cylinder <strong>${escapeHtml(cylinderSerial)}</strong> has a visual inspection due on <strong>${escapeHtml(dueDate)}</strong>.
	</p>
	<p style="color: #333; font-size: 16px;">
		Please contact the shop to schedule your visual inspection.
	</p>
${emailFooter(baseUrl)}
</body>
</html>`
}

function emailFooter(baseUrl?: string): string {
	const profileUrl = baseUrl ? `${baseUrl}/profile` : '/profile'
	return `	<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0 16px;" />
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
	<p style="color: #999; font-size: 12px;">
		<a href="${profileUrl}" style="color: #0070f3;">Manage notification preferences</a>
	</p>`
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

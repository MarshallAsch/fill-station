import { ReactNode } from 'react'

type SafetyLevel = 'warning' | 'danger'

const LEVEL_CLASSES: Record<SafetyLevel, string> = {
	warning: 'border-warning text-warning',
	danger: 'border-danger text-danger',
}

const SafetyNote = ({
	level,
	children,
}: {
	level: SafetyLevel
	children: ReactNode
}) => {
	return (
		<div
			role='alert'
			className={`${LEVEL_CLASSES[level]} rounded-md border px-3 py-2 text-sm font-medium`}
		>
			{children}
		</div>
	)
}

export default SafetyNote

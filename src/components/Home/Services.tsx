import AirTank from '@/icons/AirTank'
import { EyeIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/20/solid'

import clsx from 'clsx'

const actions = [
	{
		title: 'Tank Air Fills',
		description: 'Fill tanks with air',
		icon: AirTank,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-card-hover',
	},
	{
		title: 'Specialty Air Fills (Nitrox, Oxygen, Helium)',
		description: 'Fill tanks with specialty mixes',
		icon: AirTank,
		iconForeground: 'text-rose-700',
		iconBackground: 'bg-card-hover',
	},
	{
		title: 'Visual Inspections',
		description: 'Visual Inspect Tanks',
		icon: EyeIcon,
		iconForeground: 'text-purple-700',
		iconBackground: 'bg-card-hover',
	},
	{
		title: 'Oxygen Cleaning',
		description: 'Clean tanks',
		icon: SparklesIcon,
		iconForeground: 'text-sky-700',
		iconBackground: 'bg-card-hover',
	},
	{
		title: 'Training',
		description: 'Train people to use equipment',
		icon: UserGroupIcon,
		iconForeground: 'text-yellow-700',
		iconBackground: 'bg-card-hover',
	},
	{
		title: 'Another Service',
		description: 'Train people to use equipment',
		icon: UserGroupIcon,
		iconForeground: 'text-yellow-700',
		iconBackground: 'bg-card-hover',
	},
]

const Services = () => {
	return (
		<div className='divide-divider bg-divider-strong my-10 divide-y overflow-hidden rounded-lg shadow-sm sm:grid sm:grid-cols-2 sm:divide-y-0'>
			{actions.map((action, actionIdx) => (
				<div
					key={action.title}
					className={clsx(
						actionIdx === 0
							? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none'
							: '',
						actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
						actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
						actionIdx === actions.length - 1
							? 'rounded-br-lg rounded-bl-lg sm:rounded-bl-none'
							: '',
						'group border-border bg-background focus-within:outline-accent relative p-6 focus-within:outline-2 focus-within:-outline-offset-2 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b',
					)}
				>
					<div>
						<span
							className={clsx(
								action.iconBackground,
								action.iconForeground,
								'inline-flex rounded-lg p-3',
							)}
						>
							<action.icon aria-hidden='true' className='size-6' />
						</span>
					</div>
					<div className='mt-8'>
						<h3 className='text-text text-base font-semibold'>
							<p className='focus:outline-hidden'>
								{/* Extend touch target to entire panel */}
								<span aria-hidden='true' className='absolute inset-0' />
								{action.title}
							</p>
						</h3>
						<p className='text-light-text mt-2 text-sm'>{action.description}</p>
					</div>
				</div>
			))}
		</div>
	)
}

export default Services

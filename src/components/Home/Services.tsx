import AirTank from '@/icons/AirTank'
import { EyeIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/20/solid'

import clsx from 'clsx'

const actions = [
	{
		title: 'Tank Air Fills',
		description: 'Fill tanks with air',
		icon: AirTank,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-gray-400/5',
	},
	{
		title: 'Specialty Air Fills (Nitrox, Oxygen, Helium)',
		description: 'Fill tanks with specialty mixes',
		icon: AirTank,
		iconForeground: 'text-rose-700',
		iconBackground: 'bg-gray-400/5',
	},
	{
		title: 'Visual Inspections',
		description: 'Visual Inspect Tanks',
		icon: EyeIcon,
		iconForeground: 'text-purple-700',
		iconBackground: 'bg-gray-400/5',
	},
	{
		title: 'Oxygen Cleaning',
		description: 'Clean tanks',
		icon: SparklesIcon,
		iconForeground: 'text-sky-700',
		iconBackground: 'bg-gray-400/5',
	},
	{
		title: 'Training',
		description: 'Train people to use equipment',
		icon: UserGroupIcon,
		iconForeground: 'text-yellow-700',
		iconBackground: 'bg-gray-400/5',
	},
	{
		title: 'Another Service',
		description: 'Train people to use equipment',
		icon: UserGroupIcon,
		iconForeground: 'text-yellow-700',
		iconBackground: 'bg-gray-400/5',
	},
]

const Services = () => {
	return (
		<div className='my-10 divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-2 sm:divide-y-0'>
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
						'group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b',
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
						<h3 className='text-base font-semibold text-gray-900'>
							<p className='focus:outline-hidden'>
								{/* Extend touch target to entire panel */}
								<span aria-hidden='true' className='absolute inset-0' />
								{action.title}
							</p>
						</h3>
						<p className='mt-2 text-sm text-gray-500'>{action.description}</p>
					</div>
				</div>
			))}
		</div>
	)
}

export default Services

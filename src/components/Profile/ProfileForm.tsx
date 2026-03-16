'use client'

import { useState } from 'react'
import TextInput from '@/components/UI/FormElements/TextInput'
import Button from '@/components/UI/Button'
import { toast } from 'react-toastify'
import { updateProfile } from '@/app/_api'
import { Profile } from '@/types/profile'
import Tooltip from '@/components/UI/Tooltip'
import NumberInput from '@/components/UI/FormElements/NumberInput'

interface ProfileFormProps {
	user: Profile
}

const ProfileForm = ({ user }: ProfileFormProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [name, setName] = useState(user.name ?? '')
	const [email, setEmail] = useState(user.email ?? '')
	const [notifyContact, setNotifyContact] = useState(user.notifyContact)
	const [notifyHydro, setNotifyHydro] = useState(user.notifyHydro)
	const [notifyVisual, setNotifyVisual] = useState(user.notifyVisual)
	const [hydroReminderDays1, setHydroReminderDays1] = useState(
		user.hydroReminderDays1,
	)
	const [hydroReminderDays2, setHydroReminderDays2] = useState(
		user.hydroReminderDays2,
	)
	const [visualReminderDays1, setVisualReminderDays1] = useState(
		user.visualReminderDays1,
	)
	const [visualReminderDays2, setVisualReminderDays2] = useState(
		user.visualReminderDays2,
	)

	const handleSave = async () => {
		const data = await updateProfile({
			name,
			email,
			notifyContact,
			notifyHydro,
			notifyVisual,
			hydroReminderDays1,
			hydroReminderDays2,
			visualReminderDays1,
			visualReminderDays2,
		})

		if (typeof data !== 'string') {
			toast.success('Profile updated')
			setIsEditing(false)
		} else {
			toast.error(`Failed to update profile: ${data}`)
		}
	}

	return (
		<div className='border-border bg-background w-full max-w-md rounded-lg border p-6 shadow-sm'>
			{user.image && (
				<div className='mb-6 flex justify-center'>
					<img
						src={user.image}
						alt={user.name ?? 'Profile picture'}
						className='h-24 w-24 rounded-full object-cover'
					/>
				</div>
			)}

			{isEditing ? (
				<div className='flex flex-col gap-4'>
					<div>
						<label
							htmlFor='profile-name'
							className='text-light-text mb-1 block text-sm font-medium'
						>
							Name
						</label>
						<TextInput
							id='profile-name'
							name='name'
							type='text'
							placeholder='Name'
							ariaLabel='Name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div>
						<label
							htmlFor='profile-email'
							className='text-light-text mb-1 block text-sm font-medium'
						>
							Email
						</label>
						<TextInput
							id='profile-email'
							name='email'
							type='email'
							placeholder='Email'
							ariaLabel='Email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<Tooltip message='Can only be changed by an admin'>
						<div>
							<label className='text-light-text mb-1 block text-sm font-medium'>
								Role
							</label>
							<p className='text-light-text px-3 py-1.5 text-sm'>{user.role}</p>
						</div>
					</Tooltip>
					<div>
						<label className='text-light-text mb-1 block text-sm font-medium'>
							Linked client
						</label>
						<p className='text-light-text px-3 py-1.5 text-sm'>
							{user.clientName ?? '—'}
						</p>
					</div>
					<div className='border-border mt-4 border-t pt-4'>
						<h3 className='text-text mb-3 text-sm font-semibold'>
							Notification Preferences
						</h3>
						<div className='flex flex-col gap-3'>
							{user.role === 'admin' && (
								<label className='flex items-center gap-2'>
									<input
										type='checkbox'
										checked={notifyContact}
										onChange={(e) => setNotifyContact(e.target.checked)}
										className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
									/>
									<span className='text-text text-sm'>
										Contact form submissions
									</span>
								</label>
							)}
							<label className='flex items-center gap-2'>
								<input
									type='checkbox'
									checked={notifyHydro}
									onChange={(e) => setNotifyHydro(e.target.checked)}
									className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
								/>
								<span className='text-text text-sm'>Hydro test reminders</span>
							</label>
							{notifyHydro && (
								<div className='ml-6 flex gap-3'>
									<NumberInput
										id='hydro-days-1'
										name='hydroReminderDays1'
										label='First reminder (days)'
										value={hydroReminderDays1}
										onChange={setHydroReminderDays1}
									/>
									<NumberInput
										id='hydro-days-2'
										name='hydroReminderDays2'
										label='Second reminder (days)'
										value={hydroReminderDays2}
										onChange={setHydroReminderDays2}
									/>
								</div>
							)}
							<label className='flex items-center gap-2'>
								<input
									type='checkbox'
									checked={notifyVisual}
									onChange={(e) => setNotifyVisual(e.target.checked)}
									className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
								/>
								<span className='text-text text-sm'>
									Visual inspection reminders
								</span>
							</label>
							{notifyVisual && (
								<div className='ml-6 flex gap-3'>
									<NumberInput
										id='visual-days-1'
										name='visualReminderDays1'
										label='First reminder (days)'
										value={visualReminderDays1}
										onChange={setVisualReminderDays1}
									/>
									<NumberInput
										id='visual-days-2'
										name='visualReminderDays2'
										label='Second reminder (days)'
										value={visualReminderDays2}
										onChange={setVisualReminderDays2}
									/>
								</div>
							)}
						</div>
					</div>
					<div className='flex gap-3 pt-2'>
						<Button type='button' onClick={handleSave}>
							Save
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={() => {
								setName(user.name ?? '')
								setEmail(user.email ?? '')
								setNotifyContact(user.notifyContact)
								setNotifyHydro(user.notifyHydro)
								setNotifyVisual(user.notifyVisual)
								setHydroReminderDays1(user.hydroReminderDays1)
								setHydroReminderDays2(user.hydroReminderDays2)
								setVisualReminderDays1(user.visualReminderDays1)
								setVisualReminderDays2(user.visualReminderDays2)
								setIsEditing(false)
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<>
					<dl className='divide-divider divide-y'>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-light-text text-sm font-medium'>Name</dt>
							<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
								{name || '—'}
							</dd>
						</div>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-light-text text-sm font-medium'>Email</dt>
							<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
								{email || '—'}
							</dd>
						</div>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-light-text text-sm font-medium'>Role</dt>
							<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
								<Tooltip message='Can only be changed by an admin'>
									{user.role}
								</Tooltip>
							</dd>
						</div>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-light-text text-sm font-medium'>
								Linked client
							</dt>
							<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
								{user.clientName ?? '—'}
							</dd>
						</div>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-light-text text-sm font-medium'>
								Notifications
							</dt>
							<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
								{[
									user.role === 'admin' && user.notifyContact && 'Contact form',
									user.notifyHydro && 'Hydro reminders',
									user.notifyVisual && 'Visual reminders',
								]
									.filter(Boolean)
									.join(', ') || 'None'}
							</dd>
						</div>
					</dl>
					<div className='mt-4 flex justify-end'>
						<div className='w-24'>
							<Button type='button' onClick={() => setIsEditing(true)}>
								Edit
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default ProfileForm

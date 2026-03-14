'use client'

import { useState } from 'react'
import TextInput from '@/components/UI/FormElements/TextInput'
import Button from '@/components/UI/Button'
import { toast } from 'react-toastify'
import { updateProfile } from '@/app/_api'
import { Profile } from '@/types/profile'
import Tooltip from '@/components/UI/Tooltip'

interface ProfileFormProps {
	user: Profile
}

const ProfileForm = ({ user }: ProfileFormProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [name, setName] = useState(user.name ?? '')
	const [email, setEmail] = useState(user.email ?? '')

	const handleSave = async () => {
		const data = await updateProfile({ name, email })

		if (typeof data !== 'string') {
			toast.success('Profile updated')
			setIsEditing(false)
		} else {
			toast.error(`Failed to update profile: ${data}`)
		}
	}

	return (
		<div className='w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
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
							className='mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400'
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
							className='mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400'
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
							<label className='mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400'>
								Role
							</label>
							<p className='px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400'>
								{user.role}
							</p>
						</div>
					</Tooltip>
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
								setIsEditing(false)
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<>
					<dl className='divide-y divide-gray-100 dark:divide-gray-700'>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Name</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 dark:text-gray-100'>
								{name || '—'}
							</dd>
						</div>
						<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
							<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Email</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 dark:text-gray-100'>
								{email || '—'}
							</dd>
						</div>
							<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
								<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>

									Role
								</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 dark:text-gray-100'>
									<Tooltip message='Can only be changed by an admin'>
										{user.role}
									</Tooltip>
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

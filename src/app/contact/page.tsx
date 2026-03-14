'use client'

import Button from '@/components/UI/Button'
import TextArea from '@/components/UI/FormElements/TextArea'
import TextInput from '@/components/UI/FormElements/TextInput'
import { newContact } from '../_api'
import { toast } from 'react-toastify'

export default function Contact() {
	const handleSubmit = async (form: FormData) => {
		const formData: any = Object.fromEntries(form.entries())
		console.log(formData)

		const data = await newContact(formData)

		if (typeof data !== 'string') {
			toast.success('Thank! We will get back to you as soon as we can!')
		} else {
			toast.error(`Error: ${data}`)
		}
	}
	return (
		<div className='relative flex max-w-7xl flex-row-reverse items-center'>
			<div className='flex h-full w-1/2 items-center'>
				{/* TODO Replace with a local image and use Next Image component */}
				<img
					alt=''
					src='https://images.unsplash.com/photo-1699740549075-0a25d76823ac?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
					className='h-64 w-full bg-gray-50 object-cover sm:h-80 lg:h-3/4'
				/>
			</div>
			<div className='flex h-full w-1/2 flex-col items-center justify-center'>
				<div className='mx-auto flex max-w-xl flex-col gap-3 lg:mx-0 lg:max-w-lg'>
					<h2 className='text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl'>
						Get in touch
					</h2>
					<p className='mt-2 text-lg/8 text-gray-600'>
						Proin volutpat consequat porttitor cras nullam gravida at orci
						molestie a eu arcu sed ut tincidunt magna.
					</p>
					<form action={handleSubmit} className='flex flex-col gap-3'>
						<TextInput
							autoFocus
							type='text'
							id='name'
							name='name'
							ariaLabel='Name'
							placeholder='Who are you'
						/>

						<TextInput
							autoFocus
							type='email'
							id='email'
							name='email'
							ariaLabel='Email'
							placeholder='Email Address'
						/>

						<TextArea
							id='message'
							name='message'
							placeholder='Message'
							ariaLabel='Message'
						/>

						<div className='flex w-full justify-end py-10'>
							<div className='w-40'>
								<Button type='submit'>Submit</Button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

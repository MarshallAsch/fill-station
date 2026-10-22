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
		<div className='relative flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-6 sm:px-6 md:flex-row-reverse md:gap-0 md:px-0 md:py-0'>
			<div className='flex h-full w-full items-center md:w-1/2'>
				{/* TODO Replace with a local image and use Next Image component */}
				<img
					alt=''
					src='https://images.unsplash.com/photo-1699740549075-0a25d76823ac?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
					className='bg-surface h-32 w-full rounded-lg object-cover sm:h-64 md:h-80 md:rounded-none lg:h-3/4'
				/>
			</div>
			<div className='flex h-full w-full flex-col items-center justify-center md:w-1/2'>
				<div className='mx-auto flex w-full max-w-xl flex-col gap-3 md:px-6 lg:mx-0 lg:max-w-lg'>
					<h2 className='text-text text-3xl font-semibold tracking-tight text-pretty sm:text-5xl'>
						Get in touch
					</h2>
					<p className='text-light-text mt-2 text-lg/8'>
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

						<div className='flex w-full justify-end py-4 md:py-10'>
							<div className='w-full sm:w-40'>
								<Button type='submit'>Submit</Button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

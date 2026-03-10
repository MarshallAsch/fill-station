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
		<div className='max-w-7xl'>
			<div className='flex flex-col overflow-auto'>
				<div className='flex flex-col items-center justify-center gap-3 py-6'>
					<h1 className='text-4xl font-semibold text-gray-900'>Contact Us</h1>
				</div>

				<form action={handleSubmit}>
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
	)
}

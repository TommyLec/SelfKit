import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import { config } from '$lib/selfkit.config';
import { EmailService } from '$lib/server/email/emailService';
import type { PageServerLoad } from '../app/$types';

export const load: PageServerLoad = async () => {
	return {
		pageName: 'Contact Us',
		description:
			"Get in touch with our team. We're here to help with any questions about our services, support needs, or partnership opportunities"
	};
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const subject = formData.get('subject');
		const message = formData.get('message');

		if (typeof email !== 'string' || typeof subject !== 'string' || typeof message !== 'string') {
			return fail(400, { error: 'Invalid or missing fields' });
		}

		if (!email || !subject || !message) {
			return fail(400, { error: 'All fields are required' });
		}

		const { error } = await EmailService.send({
			from: config.emailNoreply,
			to: config.emailContact,
			subject: subject + `From  ${email}`,
			body: message
		});

		if (error) {
			return {
				success: false,
				message: 'An error occurred when sending the email, please try again later.'
			};
		}

		return {
			success: true,
			message: 'Your message has been sent successfully!'
		};
	}
};

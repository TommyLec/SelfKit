import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import { config } from '$lib/selfkit.config';
import { EmailService } from '$lib/server/email/emailService';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { contactSchema } from '$lib/forms/schemas/contactSchema';

export async function load() {
	return {
		form: await superValidate(zod(contactSchema)),
		// For meta tags
		pageName: 'Contact Us',
		description:
			"Get in touch with our team. We're here to help with any questions about our services, support needs, or partnership opportunities"
	};
}

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const form = await superValidate(event, zod(contactSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email, subject, message } = form.data;

		const { error } = await EmailService.send({
			from: config.emailNoreply,
			to: config.emailContact,
			subject: subject + `From  ${email}`,
			body: message
		});

		if (error) {
			return setError(
				form,
				'message',
				'An error occurred when sending the email, please try again later.'
			);
		}

		return {
			form
		};
	}
};

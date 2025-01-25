import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const emailChangeSchema = z
	.object({
		newEmail: z.string().email().nonempty(),
		confirmEmail: z.string().email().nonempty()
	})
	.refine((data) => data.newEmail === data.confirmEmail, {
		message: m.fun_real_deer_splash(),
		path: ['confirmEmail']
	});

export type EmailChangeSchema = typeof emailChangeSchema;

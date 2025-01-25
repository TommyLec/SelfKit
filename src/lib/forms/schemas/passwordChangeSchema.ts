import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().nonempty(),
		newPassword: z.string().nonempty(),
		confirmPassword: z.string().nonempty()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: m.loud_moving_rook_beam(),
		path: ['confirmPassword']
	});

export type PasswordChangeSchema = typeof passwordChangeSchema;

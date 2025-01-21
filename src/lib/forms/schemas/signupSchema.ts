import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const signupSchema = z
	.object({
		email: z.string().email().nonempty(),
		password: z.string().min(8, m.heroic_light_jaguar_drum()),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: m.loud_moving_rook_beam(),
		path: ['confirmPassword']
	});

export type SignupSchema = typeof signupSchema;

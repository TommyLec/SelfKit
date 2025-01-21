import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: z.string().email().nonempty()
});

export type ForgotPasswordSchema = typeof forgotPasswordSchema;

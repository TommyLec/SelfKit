import { z } from 'zod';

export const contactSchema = z.object({
	email: z.string().email().nonempty(),
	subject: z.string().nonempty(),
	message: z.string().nonempty()
});

export type ContactSchema = typeof contactSchema;

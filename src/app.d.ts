import type { AvailableLanguageTag } from '../../lib/paraglide/runtime';
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';
import type { User } from '$lib/server/auth/user';
import type { Session } from '$lib/server/database/schemas/authSchema';
import { type SubscriptionDetails } from '$lib/types/subscriptionDetails';

/// <reference types="@sveltepress/theme-default/types" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>;
			user: User | null;
			session: Session | null;
			subscriptions: SubscriptionDetails[];
		}
	}
}

export {};

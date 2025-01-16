import { checkAuthorization } from '$lib/server/auth/serverUtils';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	checkAuthorization(locals);

	return {};
};

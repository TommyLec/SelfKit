import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        pageName: "Refund Policy",
        description: "All informations about our refund policy."
    };
};
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        pageName: "FAQ",
        description: "Find answers to frequently asked questions about our services, features, and platform usage. Get quick solutions to common inquiries"
    };
};
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        pageName: "Privacy Policy",
        description: "Learn how we protect and handle your personal data. Our privacy policy details our data collection practices, your privacy rights, and our security measures"
    };
};
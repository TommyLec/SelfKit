import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        pageName: "Terms of service",
        description: "View our terms of service. Find important information about your rights, data protection, and our company's legal compliance"
    };
};
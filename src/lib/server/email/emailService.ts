import { env } from '$env/dynamic/private';

const headers = {
	'Content-Type': 'application/json',
	Authorization: `Bearer ${env.PLUNK_SECRET_KEY}`
};

type SendOptions = {
	to: string;
	subject: string;
	body: string;
	from?: string;
	reply?: string;
};

export class EmailService {
	private static async fetchWithErrorHandling(url: string, options: RequestInit) {
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(response.status + ' : ' + await response.text());
			}
			return { status: response.status };
		} catch (error) {
			console.error(error);
			return { status: 500, error };
		}
	}
	
	static async send(options: SendOptions) {
		const response = await this.fetchWithErrorHandling(env.PLUNK_URL + '/api/v1/send', {
			method: 'POST',
			headers,
			body: JSON.stringify({ ...options })
		});
		return response;
	}
	
	static async track(eventName: string, email: string, subscribed: boolean = false) {
		const response = await this.fetchWithErrorHandling(env.PLUNK_URL + '/api/v1/track', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				"event": eventName,
				"email": email,
				"subscribed": subscribed
			})
		});
		return response;
	}
}

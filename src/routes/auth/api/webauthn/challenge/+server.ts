import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import { createWebAuthnChallenge } from '$lib/server/auth/webauthn';
import { encodeBase64 } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';

const webauthnChallengeRateLimitBucket = new RefillingTokenBucket<string>(30, 10);

export async function POST(event: RequestEvent) {
	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !webauthnChallengeRateLimitBucket.consume(clientIP, 1)) {
		return new Response('Too many requests', {
			status: 429
		});
	}
	const challenge = createWebAuthnChallenge();
	return new Response(JSON.stringify({ challenge: encodeBase64(challenge) }));
}

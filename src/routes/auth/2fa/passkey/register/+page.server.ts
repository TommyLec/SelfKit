import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { bigEndian } from '@oslojs/binary';
import {
	parseAttestationObject,
	AttestationStatementFormat,
	parseClientDataJSON,
	coseAlgorithmES256,
	coseEllipticCurveP256,
	ClientDataType,
	coseAlgorithmRS256
} from '@oslojs/webauthn';
import { ECDSAPublicKey, p256 } from '@oslojs/crypto/ecdsa';
import { decodeBase64 } from '@oslojs/encoding';
import { RSAPublicKey } from '@oslojs/crypto/rsa';

import type {
	AttestationStatement,
	AuthenticatorData,
	ClientData,
	COSEEC2PublicKey,
	COSERSAPublicKey
} from '@oslojs/webauthn';
import { get2FARedirect } from '$lib/server/auth/2fa';
import { setSessionAs2FAVerified } from '$lib/server/auth/session';
import {
	getUserPasskeyCredentials,
	verifyWebAuthnChallenge,
	type WebAuthnUserCredential,
	createPasskeyCredential
} from '$lib/server/auth/webauthn';
import { checkAuthorization } from '$lib/server/auth/serverUtils';
import { config } from '$lib/selfkit.config';
import { dev } from '$app/environment';

export async function load(event: RequestEvent) {
	if (!config.enablePasskeyAuth) {
		return redirect(302, 'auth/login');
	}

	checkAuthorization(event.locals);

	if (event.locals.user!.registered2FA && !event.locals.session!.twoFactorVerified) {
		return redirect(302, get2FARedirect(event.locals.user!));
	}

	const credentials = await getUserPasskeyCredentials(event.locals.user!.id);

	const credentialUserId = new Uint8Array(8);
	bigEndian.putUint64(credentialUserId, BigInt(event.locals.user!.id), 0);

	return {
		credentials,
		credentialUserId,
		user: event.locals.user!
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}

	const formData = await event.request.formData();
	const name = formData.get('name');
	const encodedAttestationObject = formData.get('attestation_object');
	const encodedClientDataJSON = formData.get('client_data_json');
	if (
		typeof name !== 'string' ||
		typeof encodedAttestationObject !== 'string' ||
		typeof encodedClientDataJSON !== 'string'
	) {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}

	let attestationObjectBytes: Uint8Array, clientDataJSON: Uint8Array;
	try {
		attestationObjectBytes = decodeBase64(encodedAttestationObject);
		clientDataJSON = decodeBase64(encodedClientDataJSON);
	} catch {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}

	let attestationStatement: AttestationStatement;
	let authenticatorData: AuthenticatorData;
	try {
		const attestationObject = parseAttestationObject(attestationObjectBytes);
		attestationStatement = attestationObject.attestationStatement;
		authenticatorData = attestationObject.authenticatorData;
	} catch {
		return fail(400, {
			message: 'Invalid data'
		});
	}
	if (attestationStatement.format !== AttestationStatementFormat.None) {
		return fail(400, {
			message: 'Invalid data'
		});
	}

	const host = dev ? 'localhost' : config.host;
	if (!authenticatorData.verifyRelyingPartyIdHash(host)) {
		return fail(400, {
			message: 'Invalid data'
		});
	}
	if (!authenticatorData.userPresent || !authenticatorData.userVerified) {
		return fail(400, {
			message: 'Invalid data'
		});
	}
	if (authenticatorData.credential === null) {
		return fail(400, {
			message: 'Invalid data'
		});
	}

	let clientData: ClientData;
	try {
		clientData = parseClientDataJSON(clientDataJSON);
	} catch {
		return fail(400, {
			message: 'Invalid data'
		});
	}
	if (clientData.type !== ClientDataType.Create) {
		return fail(400, {
			message: 'Invalid data'
		});
	}

	if (!verifyWebAuthnChallenge(clientData.challenge)) {
		return fail(400, {
			message: 'Invalid data'
		});
	}

	const origin = dev ? 'http://localhost:5173' : `https://${config.host}`;
	if (clientData.origin !== origin) {
		return fail(400, {
			message: 'Invalid data'
		});
	}
	if (clientData.crossOrigin !== null && clientData.crossOrigin) {
		return fail(400, {
			message: 'Invalid data'
		});
	}

	let credential: WebAuthnUserCredential;
	if (authenticatorData.credential.publicKey.algorithm() === coseAlgorithmES256) {
		let cosePublicKey: COSEEC2PublicKey;
		try {
			cosePublicKey = authenticatorData.credential.publicKey.ec2();
		} catch {
			return fail(400, {
				message: 'Invalid data'
			});
		}
		if (cosePublicKey.curve !== coseEllipticCurveP256) {
			return fail(400, {
				message: 'Unsupported algorithm'
			});
		}
		const encodedPublicKey = new ECDSAPublicKey(
			p256,
			cosePublicKey.x,
			cosePublicKey.y
		).encodeSEC1Uncompressed();
		credential = {
			id: authenticatorData.credential.id,
			userId: event.locals.user.id,
			algorithmId: coseAlgorithmES256,
			name,
			publicKey: encodedPublicKey
		};
	} else if (authenticatorData.credential.publicKey.algorithm() === coseAlgorithmRS256) {
		let cosePublicKey: COSERSAPublicKey;
		try {
			cosePublicKey = authenticatorData.credential.publicKey.rsa();
		} catch {
			return fail(400, {
				message: 'Invalid data'
			});
		}
		const encodedPublicKey = new RSAPublicKey(cosePublicKey.n, cosePublicKey.e).encodePKCS1();
		credential = {
			id: authenticatorData.credential.id,
			userId: event.locals.user.id,
			algorithmId: coseAlgorithmRS256,
			name,
			publicKey: encodedPublicKey
		};
	} else {
		return fail(400, {
			message: 'Unsupported algorithm'
		});
	}

	const credentials = await getUserPasskeyCredentials(event.locals.user.id);
	if (credentials.length >= 5) {
		return fail(400, {
			message: 'Too many credentials'
		});
	}

	try {
		await createPasskeyCredential(credential);
	} catch (e) {
		console.error(e);
		return fail(500, {
			message: 'Internal error'
		});
	}

	if (!event.locals.session.twoFactorVerified) {
		setSessionAs2FAVerified(event.locals.session.id);
	}

	if (!event.locals.user.registered2FA) {
		return redirect(302, '/auth/recovery-code');
	}
	return redirect(302, '/');
}

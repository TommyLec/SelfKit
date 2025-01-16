import {
	decodePKIXECDSASignature,
	decodeSEC1PublicKey,
	p256,
	verifyECDSASignature
} from '@oslojs/crypto/ecdsa';
import {
	decodePKCS1RSAPublicKey,
	verifyRSASSAPKCS1v15Signature,
	sha256ObjectIdentifier
} from '@oslojs/crypto/rsa';
import { sha256 } from '@oslojs/crypto/sha2';
import { decodeBase64 } from '@oslojs/encoding';
import {
	type AuthenticatorData,
	parseAuthenticatorData,
	type ClientData,
	parseClientDataJSON,
	ClientDataType,
	coseAlgorithmES256,
	createAssertionSignatureMessage,
	coseAlgorithmRS256
} from '@oslojs/webauthn';
import { ObjectParser } from '@pilcrowjs/object-parser';
import type { RequestEvent } from '@sveltejs/kit';
import {
	getPasskeyCredential,
	getUserPasskeyCredential,
	getUserSecurityKeyCredential,
	verifyWebAuthnChallenge
} from './webauthn';
import { config } from '$lib/selfkit.config';
import { dev } from '$app/environment';

type CredentialType = 'passkey' | 'userSecurityKey' | 'userPasskey';

export async function handleAuthentication(event: RequestEvent, credentialType: CredentialType) {
	const data: unknown = await event.request.json();
	const parser = new ObjectParser(data);
	let encodedAuthenticatorData: string;
	let encodedClientDataJSON: string;
	let encodedCredentialId: string;
	let encodedSignature: string;
	try {
		encodedAuthenticatorData = parser.getString('authenticator_data');
		encodedClientDataJSON = parser.getString('client_data_json');
		encodedCredentialId = parser.getString('credential_id');
		encodedSignature = parser.getString('signature');
	} catch {
		return new Response('Invalid or missing fields', {
			status: 400
		});
	}
	let authenticatorDataBytes: Uint8Array;
	let clientDataJSON: Uint8Array;
	let credentialId: Uint8Array;
	let signatureBytes: Uint8Array;
	try {
		authenticatorDataBytes = decodeBase64(encodedAuthenticatorData);
		clientDataJSON = decodeBase64(encodedClientDataJSON);
		credentialId = decodeBase64(encodedCredentialId);
		signatureBytes = decodeBase64(encodedSignature);
	} catch {
		return new Response('Invalid or missing fields', {
			status: 400
		});
	}

	let authenticatorData: AuthenticatorData;
	try {
		authenticatorData = parseAuthenticatorData(authenticatorDataBytes);
	} catch {
		return new Response('Invalid data', {
			status: 400
		});
	}

	const host = dev ? 'localhost' : config.host;
	if (!authenticatorData.verifyRelyingPartyIdHash(host)) {
		return new Response('Invalid data', {
			status: 400
		});
	}
	if (!authenticatorData.userPresent) {
		return new Response('Invalid data', {
			status: 400
		});
	}

	let clientData: ClientData;
	try {
		clientData = parseClientDataJSON(clientDataJSON);
	} catch {
		return new Response('Invalid data', {
			status: 400
		});
	}
	if (clientData.type !== ClientDataType.Get) {
		return new Response('Invalid data', {
			status: 400
		});
	}

	if (!verifyWebAuthnChallenge(clientData.challenge)) {
		return new Response('Invalid data', {
			status: 400
		});
	}

	const origin = dev ? 'http://localhost:5173' : `https://${config.host}`;
	if (clientData.origin !== origin) {
		return new Response('Invalid data', {
			status: 400
		});
	}
	if (clientData.crossOrigin !== null && clientData.crossOrigin) {
		return new Response('Invalid data', {
			status: 400
		});
	}

	const credential = await getUserCredential(event.locals.user!.id, credentialId, credentialType);
	if (credential === null) {
		return new Response('Invalid credential', {
			status: 400
		});
	}

	let validSignature: boolean;
	if (credential.algorithmId === coseAlgorithmES256) {
		const ecdsaSignature = decodePKIXECDSASignature(signatureBytes);
		const ecdsaPublicKey = decodeSEC1PublicKey(p256, credential.publicKey);
		const hash = sha256(createAssertionSignatureMessage(authenticatorDataBytes, clientDataJSON));
		validSignature = verifyECDSASignature(ecdsaPublicKey, hash, ecdsaSignature);
	} else if (credential.algorithmId === coseAlgorithmRS256) {
		const rsaPublicKey = decodePKCS1RSAPublicKey(credential.publicKey);
		const hash = sha256(createAssertionSignatureMessage(authenticatorDataBytes, clientDataJSON));
		validSignature = verifyRSASSAPKCS1v15Signature(
			rsaPublicKey,
			sha256ObjectIdentifier,
			hash,
			signatureBytes
		);
	} else {
		return new Response('Internal error', {
			status: 500
		});
	}

	if (!validSignature) {
		return new Response('Invalid signature', {
			status: 400
		});
	}

	return credential;
}

function getUserCredential(
	userId: number,
	credentialId: Uint8Array,
	credentialType: CredentialType
) {
	switch (credentialType) {
		case 'userPasskey':
			return getUserPasskeyCredential(userId, credentialId);
		case 'userSecurityKey':
			return getUserSecurityKeyCredential(userId, credentialId);
		case 'passkey':
			return getPasskeyCredential(credentialId);
		//case 'securityKey' : return getsecuri(userId, credentialId);
	}
}

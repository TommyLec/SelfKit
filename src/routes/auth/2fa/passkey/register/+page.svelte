<script lang="ts">
	import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";
	import { enhance } from "$app/forms";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as m from '$lib/paraglide/messages.js';
	import { config } from "$lib/selfkit.config.js";

	let { data, form } = $props();

	let encodedAttestationObject: string | null = $state(null);
	let encodedClientDataJSON: string | null = $state(null);
</script>
<div class="flex flex-col items-center gap-3 m-5">
	<h1 class="text-2xl font-bold">{m.loved_noisy_warthog_spin()}</h1>
<Button
	class="my-3"
	variant="secondary"
	disabled={encodedAttestationObject !== null && encodedClientDataJSON !== null}
	onclick={async () => {
		const challenge = await createChallenge();

		const credential = await navigator.credentials.create({
			publicKey: {
				challenge,
				user: {
					id: data.credentialUserId,
					name: data.user.email,
					displayName: data.user.email
				},
				rp: {
					name: config.appName
				},
				pubKeyCredParams: [
					{
						alg: -7,
						type: "public-key"
					},
					{
						alg: -257,
						type: "public-key"
					}
				],
				attestation: "none",
				authenticatorSelection: {
					userVerification: "required",
					residentKey: "required",
					requireResidentKey: true
				},
				excludeCredentials: data.credentials.map((credential: { id: any; }) => {
					return {
						id: credential.id,
						type: "public-key"
					};
				})
			}
		});

		if (!(credential instanceof PublicKeyCredential)) {
			throw new Error("Failed to create public key");
		}
		if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
			throw new Error("Unexpected error");
		}

		encodedAttestationObject = encodeBase64(new Uint8Array(credential.response.attestationObject));
		encodedClientDataJSON = encodeBase64(new Uint8Array(credential.response.clientDataJSON));
	}}>Create credential</Button
>
<form class="flex items-center gap-2" method="post" use:enhance>
	<Input id="form-register-credential.name" name="name" placeholder="Credential name" />
	<input type="hidden" name="attestation_object" value={encodedAttestationObject} />
	<input type="hidden" name="client_data_json" value={encodedClientDataJSON} />
	<Button disabled={encodedAttestationObject === null && encodedClientDataJSON === null}>{m.crazy_plain_seal_believe()}</Button>
	{#if form?.message}
	<p class="text-destructive">{form?.message ?? ''}</p>
{/if}
</form>

</div>

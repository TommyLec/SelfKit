<script lang="ts">
	import { goto } from '$app/navigation';
	import { encodeBase64 } from '@oslojs/encoding';
	import { createChallenge } from '$lib/client/webauthn';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { WebAuthnUserCredential } from '$lib/server/auth/webauthn';
	import type { User } from '$lib/server/auth/user';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		data: {
			user: User | null;
			credentials: WebAuthnUserCredential[];
		};
		mode?: 'authenticate' | 'reset';
	};

	let { data, mode = 'authenticate' }: Props = $props();

	let message = $state('');
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<Icon class="w-36 h-36 m-auto" icon="material-symbols:security-key" />
		<div>
			<h1 class="text-2xl font-bold">{m.extra_less_monkey_aim()}</h1>
		</div>
		<div class="grid gap-2">
			<Button
				onclick={async () => {
					const challenge = await createChallenge();

					const credential = await navigator.credentials.get({
						publicKey: {
							challenge,
							userVerification: 'discouraged',
							allowCredentials: data.credentials.map((credential: { id: any }) => {
								return {
									id: credential.id,
									type: 'public-key'
								};
							})
						}
					});

					if (!(credential instanceof PublicKeyCredential)) {
						throw new Error('Failed to create public key');
					}
					if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
						throw new Error('Unexpected error');
					}

					const response = await fetch(
						mode === 'authenticate' ? '/2fa/security-key' : '/auth/reset-password/2fa/security-key',
						{
							method: 'POST',
							body: JSON.stringify({
								credential_id: encodeBase64(new Uint8Array(credential.rawId)),
								signature: encodeBase64(new Uint8Array(credential.response.signature)),
								authenticator_data: encodeBase64(
									new Uint8Array(credential.response.authenticatorData)
								),
								client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
							})
						}
					);

					if (response.ok) {
						goto(mode === 'authenticate' ? '/app' : '/auth/reset-password');
					} else {
						message = await response.text();
					}
				}}>{m.cute_equal_shad_gulp()}</Button
			>
			<div>
				{#if message}
					<p class="text-destructive">{message ?? ''}</p>
				{/if}
				<span class="text-sm text-muted-foreground"
					>{m.sea_stale_impala_type()} <a class="hover:text-primary underline" href="/auth/2fa/reset"
						>{m.shy_new_badger_adapt()}</a
					></span
				>
			</div>
		</div>
		<div class="grid gap-2">
			{#if data.user!.registeredTOTP}
				<Button variant="outline" href="/auth/2fa/totp"
					><Icon icon="material-symbols:security" />{m.close_glad_tapir_thrive()}</Button
				>
			{/if}
			{#if data.user!.registeredPasskey}
				<Button variant="outline" href="/auth/2fa/passkey"
					><Icon icon="material-symbols:passkey" />{m.caring_ago_samuel_twist()}</Button
				>
			{/if}
		</div>
	</div>
</div>

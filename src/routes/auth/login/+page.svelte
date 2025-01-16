<script lang="ts">
	import { enhance } from '$app/forms';
	import { createChallenge } from '$lib/client/webauthn';
	import { encodeBase64 } from '@oslojs/encoding';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Icon from '@iconify/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();

	let passkeyErrorMessage = $state('');

	async function handleSignin() {
		const challenge = await createChallenge();

		const credential = await navigator.credentials.get({
			publicKey: {
				challenge,
				userVerification: 'required'
			}
		});

		if (!(credential instanceof PublicKeyCredential)) {
			throw new Error('Failed to create public key');
		}
		if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
			throw new Error('Unexpected error');
		}

		const response = await fetch('/auth/login/passkey', {
			method: 'POST',
			body: JSON.stringify({
				credential_id: encodeBase64(new Uint8Array(credential.rawId)),
				signature: encodeBase64(new Uint8Array(credential.response.signature)),
				authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
				client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
			})
		});

		if (response.ok) {
			goto('/app');
		} else {
			passkeyErrorMessage = await response.text();
		}
	}
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.plane_loved_myna_ripple()}</h1>
			<p class="text-sm text-muted-foreground">{m.least_new_butterfly_strive()}</p>
		</div>

		<form class="grid gap-2" method="post" use:enhance>
			<Input
				type="email"
				id="form-login.email"
				name="email"
				autocomplete="email"
				placeholder="Email"
				required
				value={form?.email ?? ''}
			/>
			<Input
				type="password"
				id="form-login.password"
				name="password"
				autocomplete="current-password"
				placeholder="Password"
				required
			/>

			<Button id="login-button" data-umami-event="Login button" data-umami-event-type="Standard" type="submit">{m.crazy_plain_seal_believe()}</Button>

			{#if passkeyErrorMessage}
				<p class="text-sm text-destructive-foreground">{passkeyErrorMessage}</p>
			{/if}
			{#if form?.message}
				<p class="text-destructive">{form.message ?? ''}</p>
			{/if}
		</form>

		<div class="relative">
			<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
			<div class="relative flex justify-center text-sm text-muted-foreground">
				<p class="bg-background px-2">{m.early_alert_porpoise_lend()}</p>
			</div>
		</div>

		<div class="grid gap-2">
			<Button id="google-button" data-umami-event="Login button" data-umami-event-type="Google" variant="outline" href="/auth/google"><Icon icon="devicon:google" />Google</Button>
			<Button id="passkey-button" data-umami-event="Login button" data-umami-event-type="Passkey" variant="outline" onclick={handleSignin}
				><Icon icon="material-symbols:passkey" />{m.next_safe_ox_gasp()}</Button
			>
		</div>

		<div class="flex justify-center items-center h-5">
			<Button variant="link" href="/auth/signup">{m.maroon_neat_buzzard_bake()}</Button>
			<Separator orientation="vertical" />
			<Button variant="link" href="/auth/forgot-password">{m.small_teal_reindeer_rest()}</Button>
		</div>
	</div>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputOTP from '$lib/components/ui/input-otp/index.ts';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { User } from '$lib/server/auth/user';
	import Icon from '@iconify/svelte';
	import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'bits-ui';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		data: {
			user: User | null;
		};
		form: {
			message: string;
		} | null;
		mode?: 'authenticate' | 'reset';
	};

	let { data, form, mode = 'authenticate' }: Props = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<Icon class="w-36 h-36 m-auto" icon="material-symbols:security" />

		<div>
			<h1 class="text-2xl font-bold">{m.strong_curly_millipede_dart()}</h1>
		</div>
		<form
			class="flex flex-col gap-3 items-center"
			method="post"
			action={mode === 'authenticate'
				? '/auth/2fa/totp?/auth'
				: '/auth/reset-password/2fa/totp?/reset'}
			use:enhance
		>
			<Label class="text-muted-foreground" for="form-totp.code">{m.nice_mealy_polecat_sway()}</Label
			>
			<InputOTP.Root
				maxlength={6}
				pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
				id="form-totp.code"
				name="code"
				required
			>
				{#snippet children({ cells })}
					<InputOTP.Group>
						{#each cells as cell}
							<InputOTP.Slot {cell} />
						{/each}
					</InputOTP.Group>
				{/snippet}
			</InputOTP.Root>

			<Button class="w-full mt-2" type="submit">{m.crazy_plain_seal_believe()}</Button>

			{#if form?.message}
				<p class="text-destructive">{form.message ?? ''}</p>
			{/if}

			<span class="text-sm text-muted-foreground"
				>{m.early_shy_herring_work()} <a
					class="hover:text-primary underline"
					href={mode === 'authenticate'
						? '/auth/2fa/reset'
						: '/auth/reset-password/2fa/recovery-code'}>{m.odd_bald_niklas_fall}</a
				></span
			>
		</form>

		{#if data.user!.registeredPasskey || data.user!.registeredSecurityKey}
			<div class="relative">
				<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
				<div class="relative flex justify-center text-sm text-muted-foreground">
					<p class="bg-background px-2">{m.early_alert_porpoise_lend()}</p>
				</div>
			</div>
		{/if}

		<div class="grid gap-2">
			{#if data.user!.registeredPasskey}
				<Button
					variant="outline"
					href={mode === 'authenticate' ? '/auth/2fa/passkey' : '/auth/reset-password/2fa/passkey'}
					><Icon icon="material-symbols:passkey" /> {m.stock_alert_samuel_offer()}</Button
				>
			{/if}
			{#if data.user!.registeredSecurityKey}
				<Button
					variant="outline"
					href={mode === 'authenticate'
						? '/auth/2fa/security-key'
						: '/auth/reset-password/2fa/security-key'}
					><Icon icon="material-symbols:security-key" />{m.quiet_real_thrush_dig()}</Button
				>
			{/if}
		</div>
	</div>
</div>

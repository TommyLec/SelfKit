<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { encodeBase64 } from '@oslojs/encoding';
	import * as m from '$lib/paraglide/messages.js';
	import { type PasswordChangeSchema } from '$lib/forms/schemas/passwordChangeSchema.js';
	import { type SuperValidated, type Infer } from 'sveltekit-superforms';
	import type { User } from '$lib/server/auth/user';
	import type { WebAuthnUserCredential } from '$lib/server/auth/webauthn';
	import PasswordChangeForm from '$lib/components/forms/passwordChangeForm.svelte';
	import EmailChangeForm from '$lib/components/forms/emailChangeForm.svelte';
	import type { EmailChangeSchema } from '$lib/forms/schemas/emailChangeSchema';
	import { enhance as sEnhance } from '$app/forms';

	type Props = {
		recoveryCode: string | null;
		user: User;
		passkeyCredentials: WebAuthnUserCredential[];
		securityKeyCredentials: WebAuthnUserCredential[];
		emailChangeForm: SuperValidated<Infer<EmailChangeSchema>>;
		passwordChangeForm: SuperValidated<Infer<PasswordChangeSchema>>;
	};

	let { data }: { data: Props } = $props();
</script>

<div class="w-full grid gap-6 px-5 md:px-10 mb-10">
	<div>
		<h1 class="text-2xl font-bold">{m.warm_round_fly_zip()}</h1>
		<p class="text-muted-foreground">{m.smug_novel_mink_bump()}</p>
	</div>

	<Separator class="my-4" />

	{#if !data.user.useProvider}
		<EmailChangeForm form={data.emailChangeForm} currentEmail={data.user.email} />
		<Separator class="my-4" />
		<PasswordChangeForm form={data.passwordChangeForm} />
		<Separator class="my-4" />
	{/if}

	<section>
		<h2>Authenticator app</h2>
		{#if !data.user.registeredTOTP}
			<Button variant="outline" href="/auth/2fa/totp/setup"
				>{m.whole_loved_barbel_taste()} TOTP</Button
			>
			<form method="post" use:sEnhance action="?/disconnect_totp">
				<Button class="w-full text-destructive" variant="ghost" type="submit"
					>{m.lime_wild_shell_grace()}</Button
				>
			</form>
		{:else}
			<Button variant="outline" href="/auth/2fa/totp/setup">{m.broad_ideal_alpaca_sway()}</Button>
		{/if}
	</section>

	<Separator class="my-4" />

	<section>
		<h2>{m.stock_alert_samuel_offer()}</h2>
		<p class="text-muted-foreground">
			{m.sea_busy_worm_hack()}
		</p>
		<ul>
			{#each data.passkeyCredentials as credential}
				<li>
					<p>{credential.name}</p>
					<form method="post" use:sEnhance action="?/delete_passkey">
						<Input type="hidden" name="credential_id" value={encodeBase64(credential.id)} />
						<Button variant="destructive" type="submit">Delete</Button>
					</form>
				</li>
			{/each}
		</ul>
		<Button variant="outline" href="/auth/2fa/passkey/register">Add</Button>
	</section>

	<Separator class="my-4" />

	<section>
		<h2>{m.quiet_real_thrush_dig()}</h2>
		<p class="text-muted-foreground">
			{m.weak_slow_mongoose_embrace()}
		</p>
		<ul>
			{#each data.securityKeyCredentials as credential}
				<li>
					<p>{credential.name}</p>
					<form method="post" use:sEnhance action="?/delete_security_key">
						<Input type="hidden" name="credential_id" value={encodeBase64(credential.id)} />
						<Button variant="destructive" type="submit">{m.short_lucky_mouse_forgive()}</Button>
					</form>
				</li>
			{/each}
		</ul>
		<Button variant="outline" href="/auth/2fa/security-key/register"
			>{m.sharp_heroic_coyote_tear()}</Button
		>
	</section>
	{#if data.recoveryCode !== null}
		<Separator class="my-4" />

		<section>
			<h2>{m.wild_east_bullock_snip()}</h2>
			<p>{m.early_brief_bat_inspire()} {data.recoveryCode}}</p>
			<form method="post" use:sEnhance action="?/regenerate_recovery_code">
				<Button variant="outline" type="submit">{m.full_vexed_niklas_nail()}</Button>
			</form>
		</section>
	{/if}
</div>

<style>
	section {
		@apply grid gap-2;
	}
	h2 {
		@apply text-xl font-semibold;
	}
	form {
		@apply grid gap-2;
	}
</style>

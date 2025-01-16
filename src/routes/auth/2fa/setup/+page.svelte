<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { config } from '$lib/selfkit.config';
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.silly_cool_kangaroo_fry()}</h1>
		</div>
		<div class="grid gap-2">
			{#if config.enableTotpAuth}<Button variant="outline" href="/auth/2fa/totp/setup"
					><Icon icon="material-symbols:security" />{m.close_glad_tapir_thrive()}</Button
				>{/if}
			{#if config.enablePasskeyAuth}<Button variant="outline" href="/auth/2fa/passkey/register"
					><Icon icon="material-symbols:passkey" />{m.caring_ago_samuel_twist()}</Button
				>{/if}
			{#if config.enableSecurityKeyAuth}<Button
					variant="outline"
					href="/auth/2fa/security-key/register"
					><Icon icon="material-symbols:security-key" />{m.long_ideal_sheep_trip()}</Button
				>{/if}
		</div>
		<p class="text-sm text-muted-foreground">
			{m.many_formal_gopher_drop()}
		</p>
	</div>
</div>

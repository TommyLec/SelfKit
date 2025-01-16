<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputOTP from '$lib/components/ui/input-otp/index.ts';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'bits-ui';
	import * as m from '$lib/paraglide/messages.js';

	let { data, form } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.key_fluffy_toucan_reap()}</h1>
		</div>
		<div class="grid gap-3">
			<form class="flex flex-col gap-3 items-center" method="post" use:enhance>
				<p class="text-muted-foreground">{m.every_muddy_rook_yell()} {data.email}.</p>
				<InputOTP.Root
					maxlength={8}
					pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
					id="form-verify.code"
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
				<Button class="w-full mt-2" type="submit">{m.equal_plain_bobcat_bake()}</Button>
				{#if form?.verify?.message}
					<p class="text-destructive">{form?.verify?.message ?? ''}</p>
				{/if}
			</form>
			<form method="post" use:enhance action="?/resend">
				<Button class="w-full" variant="outline" type="submit">{m.heavy_these_niklas_mop()}</Button>
				{#if form?.resend?.message}
					<p class="text-destructive">{form?.resend?.message ?? ''}</p>
				{/if}
			</form>
		</div>
		{#if data.user?.useProvider}
			<Separator />
			<p class="text-muted-foreground text-sm">
				{m.mealy_flat_goldfish_jolt()} <a class="underline hover:text-primary" href="/account/settings"
					>{m.mealy_tidy_reindeer_lead()}</a
				>
			</p>
		{/if}
	</div>
</div>

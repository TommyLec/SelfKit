<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();
</script>

<div class="  mx-auto sm:max-w-[300px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.maroon_neat_buzzard_bake()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.level_civil_racoon_hike()}
			</p>
		</div>

		<form class="grid gap-2" method="post" use:enhance>
			<Input
				type="email"
				id="form-signup.email"
				name="email"
				autocomplete="email"
				placeholder="Email"
				required
				value={form?.email ?? ''}
			/>
			<div>
				<Input
					type="password"
					id="form-signup.password"
					name="password"
					autocomplete="new-password"
					placeholder="Password"
					required
				/>
				<p class="text-start text-xs text-muted-foreground">
					{m.heroic_light_jaguar_drum()}
				</p>
			</div>
			<Button id="signup-button" data-umami-event="Signup button" data-umami-event-email={form?.email ?? ''} data-umami-event-type="Standard" class="w-full mt-3" type="submit">{m.plane_loved_myna_ripple()}</Button>
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

		<Button variant="outline" data-umami-event="Signup button" data-umami-event-type="Provider" href="/auth/google"><Icon icon="devicon:google" /> Google</Button>

		<p class="text-sm text-muted-foreground">
			{m.gross_dizzy_chicken_hush()} <a href="/terms" class="underline hover:text-primary"
				>{m.patient_bald_myna_wish()}</a
			>
			{m.polite_upper_wolf_grace()} <a href="/privacy" class="underline hover:text-primary">{m.aqua_this_reindeer_transform()}</a>.
		</p>
	</div>
</div>

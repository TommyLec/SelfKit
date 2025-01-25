<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SignupForm from '$lib/components/forms/signupForm.svelte';
	import type { SignupSchema } from '$lib/forms/schemas/signupSchema';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<SignupSchema>> } } = $props();
</script>

<div class="  mx-auto sm:max-w-[300px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.maroon_neat_buzzard_bake()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.level_civil_racoon_hike()}
			</p>
		</div>

		<SignupForm form={data.form} />

		<div class="relative">
			<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
			<div class="relative flex justify-center text-sm text-muted-foreground">
				<p class="bg-background px-2">{m.early_alert_porpoise_lend()}</p>
			</div>
		</div>

		<Button
			variant="outline"
			data-umami-event="Signup button"
			data-umami-event-type="Provider"
			href="/auth/google"><Icon icon="devicon:google" /> Google</Button
		>

		<p class="text-sm text-muted-foreground">
			{m.gross_dizzy_chicken_hush()}
			<a href="/terms" class="underline hover:text-primary">{m.patient_bald_myna_wish()}</a>
			{m.polite_upper_wolf_grace()}
			<a href="/privacy" class="underline hover:text-primary">{m.aqua_this_reindeer_transform()}</a
			>.
		</p>
	</div>
</div>

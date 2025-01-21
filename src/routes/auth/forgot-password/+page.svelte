<script lang="ts">
	import ForgotPasswordForm from '$lib/components/forms/forgotPasswordForm.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { type ForgotPasswordSchema } from '$lib/forms/schemas/forgotPasswordSchema';
	import * as m from '$lib/paraglide/messages.js';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<ForgotPasswordSchema>> } } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.small_teal_reindeer_rest()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.funny_next_midge_greet()}
			</p>
		</div>

		<ForgotPasswordForm form={data.form} />

		<div class="relative">
			<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
			<div class="relative flex justify-center text-sm text-muted-foreground">
				<p class="bg-background px-2">{m.north_dry_myna_jump()}</p>
			</div>
		</div>

		<Button variant="outline" href="/auth/login">{m.plane_loved_myna_ripple()}</Button>
	</div>
</div>

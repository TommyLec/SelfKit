<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.small_teal_reindeer_rest()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.funny_next_midge_greet()}
			</p>
		</div>
		<form class="grid gap-2" method="post" use:enhance>
			<Input
				type="email"
				id="form-forgot.email"
				name="email"
				required
				value={form?.email ?? ''}
				placeholder="Email"
			/>
			<Button type="submit" class="w-full">{m.nimble_late_lemur_amaze()}</Button>
			<p>{form?.message ?? ''}</p>
		</form>

		<div class="relative">
			<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
			<div class="relative flex justify-center text-sm text-muted-foreground">
				<p class="bg-background px-2">{m.north_dry_myna_jump()}</p>
			</div>
		</div>

		<Button variant="outline" href="/auth/login">{m.plane_loved_myna_ripple()}</Button>
	</div>
</div>

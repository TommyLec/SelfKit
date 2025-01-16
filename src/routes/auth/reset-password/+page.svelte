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
			<h1 class="text-2xl font-bold">{m.these_polite_orangutan_compose()}</h1>
		</div>
		<form class="flex flex-col gap-3 items-center" method="post" use:enhance>
			<Input
				type="password"
				id="form-reset.password"
				name="password"
				autocomplete="new-password"
				required
				placeholder="New password"
			/>
			<Button class="w-full" type="submit">{m.dry_broad_moth_leap()}</Button>
			{#if form?.message}
				<p class="text-destructive">{form.message ?? ''}</p>
			{/if}
		</form>
	</div>
</div>

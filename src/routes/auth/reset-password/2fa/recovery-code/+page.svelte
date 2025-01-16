<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.odd_bald_niklas_fall()}</h1>
		</div>
		<form class="flex flex-col gap-3 items-center" method="post" use:enhance>
			<Label class="text-muted-foreground" for="form-recovery-code.code"
				>{m.orange_sweet_penguin_sail()}</Label
			>
			<Input id="form-recovery-code.code" name="code" required />
			<Button class="w-full" type="submit">{m.equal_plain_bobcat_bake()}</Button>
			{#if form?.message}
				<p class="text-destructive">{form.message ?? ''}</p>
			{/if}
		</form>
	</div>
</div>

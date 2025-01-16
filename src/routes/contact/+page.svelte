<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();
</script>

<div class="mx-auto sm:max-w-[350px] p-5 sm:p-0 my-20">
	<div class="grid gap-6">
		<div class="text-center">
			<h1 class="text-5xl font-bold">{m.dark_salty_newt_talk()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.cozy_wise_hedgehog_play()}
			</p>
		</div>

		<form class="grid gap-4" method="post" use:enhance>
			<div class="grid gap-2">
				<Input
					type="email"
					id="form-contact.email"
					name="email"
					placeholder="Your email"
					required
				/>
				<Input
					type="text"
					id="form-contact.subject"
					name="subject"
					placeholder="Subject"
					required
				/>
				<Textarea
					id="form-contact.message"
					name="message"
					placeholder="Your message"
					rows={5}
					required
				/>
			</div>

			<Button type="submit" class="w-full">{m.gray_zesty_orangutan_glow()}</Button>

			{#if form?.message}
				<p
					class="text-center"
					class:text-destructive={!form?.success}
					class:text-green-500={form?.success}
				>
					{form.message}
				</p>
			{/if}
		</form>
	</div>
</div>

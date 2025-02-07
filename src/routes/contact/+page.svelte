<script lang="ts">
	import ContactForm from '$lib/components/forms/contactForm.svelte';
	import type { ContactSchema } from '$lib/forms/schemas/contactSchema';
	import * as m from '$lib/paraglide/messages.js';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<ContactSchema>> } } = $props();
	$inspect(data.form)
</script>

<div class="mx-auto sm:max-w-[350px] p-5 sm:p-0 my-20">
	<div class="grid gap-6">
		<div class="text-center">
			<h1 class="text-5xl font-bold">{m.dark_salty_newt_talk()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.cozy_wise_hedgehog_play()}
			</p>
		</div>

		<ContactForm form={data.form} />
	</div>
</div>

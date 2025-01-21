<script lang="ts">
	import PasswordResetForm from '$lib/components/forms/passwordResetForm.svelte';
	import type { PasswordResetSchema } from '$lib/forms/schemas/resetPasswordSchema';
	import * as m from '$lib/paraglide/messages.js';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<PasswordResetSchema>> } } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.these_polite_orangutan_compose()}</h1>
		</div>

		<PasswordResetForm form={data.form} />
	</div>
</div>

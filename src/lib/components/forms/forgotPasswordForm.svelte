<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import {
		forgotPasswordSchema,
		type ForgotPasswordSchema
	} from '$lib/forms/schemas/forgotPasswordSchema';

	const { form }: { form: SuperValidated<Infer<ForgotPasswordSchema>> } = $props();

	const forgotPasswordForm = superForm(form, {
		validators: zodClient(forgotPasswordSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Email successfully changed!');
			}
		}
	});

	const { form: formData, enhance } = forgotPasswordForm;
</script>

<form class="grid gap-2" method="post" use:enhance>
	<Form.Field form={forgotPasswordForm} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.awake_sleek_cowfish_breathe()}</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" autocomplete="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button type="submit" class="w-full">{m.nimble_late_lemur_amaze()}</Form.Button>
</form>

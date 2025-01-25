<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		passwordResetSchema,
		type PasswordResetSchema
	} from '$lib/forms/schemas/resetPasswordSchema';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';

	const { form }: { form: SuperValidated<Infer<PasswordResetSchema>> } = $props();

	const passwordResetForm = superForm(form, {
		validators: zodClient(passwordResetSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Password successfully changed!');
			}
		}
	});

	const { form: formData, enhance } = passwordResetForm;
</script>

<form class="flex flex-col gap-3 items-center" method="post" use:enhance>
	<Form.Field form={passwordResetForm} name="newPassword">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.teary_fit_goose_offer()}</Form.Label>
				<Input {...props} bind:value={$formData.newPassword} type="password" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={passwordResetForm} name="confirmPassword">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.less_witty_quail_grace()}</Form.Label>
				<Input {...props} bind:value={$formData.confirmPassword} type="password" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full" type="submit">{m.dry_broad_moth_leap()}</Form.Button>
</form>

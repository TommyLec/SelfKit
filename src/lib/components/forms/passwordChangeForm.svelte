<script lang="ts">
	import {
		passwordChangeSchema,
		type PasswordChangeSchema
	} from '$lib/forms/schemas/passwordChangeSchema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import { toast } from 'svelte-sonner';

	const { form }: { form: SuperValidated<Infer<PasswordChangeSchema>> } = $props();

	const passwordChangeForm = superForm(form, {
		validators: zodClient(passwordChangeSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Password successfully changed!');
			}
		}
	});

	const { form: formData, enhance } = passwordChangeForm;
</script>

<section>
	<h2 class="text-xl font-semibold">{m.acidic_jolly_alpaca_gasp()}</h2>
	<form method="post" use:enhance action="?/update_password">
		<Form.Field form={passwordChangeForm} name="currentPassword">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.soft_active_cowfish_revive()}</Form.Label>
					<Input {...props} bind:value={$formData.currentPassword} type="password" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field form={passwordChangeForm} name="newPassword">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.teary_fit_goose_offer()}</Form.Label>
					<Input {...props} bind:value={$formData.newPassword} type="password" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field form={passwordChangeForm} name="confirmPassword">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.less_witty_quail_grace()}</Form.Label>
					<Input {...props} bind:value={$formData.confirmPassword} type="password" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button variant="secondary" type="submit">{m.whole_loved_barbel_taste()}</Form.Button>
	</form>
</section>

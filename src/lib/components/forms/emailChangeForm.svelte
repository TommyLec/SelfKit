<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { emailChangeSchema, type EmailChangeSchema } from '$lib/forms/schemas/emailChangeSchema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';

	const {
		form,
		currentEmail
	}: { form: SuperValidated<Infer<EmailChangeSchema>>; currentEmail: string } = $props();

	const emailChangeForm = superForm(form, {
		validators: zodClient(emailChangeSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Email successfully changed!');
			}
		}
	});

	const { form: formData, enhance } = emailChangeForm;
</script>

<section>
	<h2 class="text-xl font-semibold">{m.ornate_honest_cuckoo_boil()}</h2>
	<p class="text-muted-foreground">{m.light_elegant_dachshund_feel()} {currentEmail}</p>
	<form method="post" use:enhance action="?/update_email">
		<Form.Field form={emailChangeForm} name="newEmail">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.short_weird_beaver_dream()}</Form.Label>
					<Input {...props} bind:value={$formData.newEmail} type="email" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field form={emailChangeForm} name="confirmEmail">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.topical_patient_gorilla_flop()}</Form.Label>
					<Input {...props} bind:value={$formData.confirmEmail} type="email" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button variant="secondary" type="submit">{m.whole_loved_barbel_taste()}</Form.Button>
	</form>
</section>

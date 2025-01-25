<script lang="ts">
	import { contactSchema, type ContactSchema } from '$lib/forms/schemas/contactSchema';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as m from '$lib/paraglide/messages.js';

	const { form }: { form: SuperValidated<Infer<ContactSchema>> } = $props();

	const contactForm = superForm(form, {
		validators: zodClient(contactSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Email successfully send!');
			}
		}
	});

	const { form: formData, enhance } = contactForm;
</script>

<form method="post" use:enhance>
	<Form.Field form={contactForm} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.awake_sleek_cowfish_breathe()}</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" autocomplete="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={contactForm} name="subject">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.suave_ok_cowfish_persist()}</Form.Label>
				<Input {...props} bind:value={$formData.subject} required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={contactForm} name="message">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.bright_strong_baboon_greet()}</Form.Label>
				<Textarea {...props} bind:value={$formData.message} rows={5} required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button type="submit" class="w-full">{m.gray_zesty_orangutan_glow()}</Form.Button>
</form>

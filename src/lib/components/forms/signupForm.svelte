<script lang="ts">
	import { signupSchema, type SignupSchema } from '$lib/forms/schemas/signupSchema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as m from '$lib/paraglide/messages.js';

	const { form }: { form: SuperValidated<Infer<SignupSchema>> } = $props();

	const signupForm = superForm(form, {
		validators: zodClient(signupSchema)
	});

	const { form: formData, enhance } = signupForm;
</script>

<form class="grid gap-2" method="post" use:enhance>
	<Form.Field form={signupForm} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.awake_sleek_cowfish_breathe()}</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" autocomplete="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={signupForm} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.sharp_bland_mole_list()}</Form.Label>
				<Input {...props} bind:value={$formData.password} type="password" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={signupForm} name="confirmPassword">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.less_witty_quail_grace()}</Form.Label>
				<Input {...props} bind:value={$formData.confirmPassword} type="password" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button
		id="signup-button"
		data-umami-event="Signup button"
		data-umami-event-email={$formData.email ?? ''}
		data-umami-event-type="Standard"
		class="w-full"
		type="submit">{m.plane_loved_myna_ripple()}</Form.Button
	>
</form>

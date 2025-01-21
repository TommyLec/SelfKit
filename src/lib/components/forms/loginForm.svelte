<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { loginSchema, type LoginSchema } from '$lib/forms/schemas/loginSchema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as m from '$lib/paraglide/messages.js';

	const { form }: { form: SuperValidated<Infer<LoginSchema>> } = $props();

	const loginForm = superForm(form, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance } = loginForm;
</script>

<form class="grid gap-2" use:enhance method="post">
	<Form.Field form={loginForm} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.awake_sleek_cowfish_breathe()}</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" autocomplete="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field form={loginForm} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.sharp_bland_mole_list()}</Form.Label>
				<Input {...props} bind:value={$formData.password} type="password" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button
		id="login-button"
		data-umami-event="Login button"
		data-umami-event-type="Standard"
		type="submit">{m.crazy_plain_seal_believe()}</Form.Button
	>
</form>

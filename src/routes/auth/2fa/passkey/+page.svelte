<script lang="ts">
	import PasskeyForm from "$lib/components/auth/2fa/passkeyForm.svelte";

	let { data } = $props();
</script>

<PasskeyForm {data} />
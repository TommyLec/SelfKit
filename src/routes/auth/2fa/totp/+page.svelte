<script lang="ts">
	import TotpForm from "$lib/components/auth/2fa/totpForm.svelte";
	let { data, form } = $props();
</script>

<TotpForm {data} {form} />
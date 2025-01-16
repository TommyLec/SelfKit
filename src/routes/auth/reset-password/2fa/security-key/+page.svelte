<script lang="ts">
	import SecurityKeysForm from "$lib/components/auth/2fa/securityKeysForm.svelte";

	let { data } = $props();
</script>

<SecurityKeysForm {data} mode="reset" />
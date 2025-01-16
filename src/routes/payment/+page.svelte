<script lang="ts">
	import Pricing from "$lib/components/pricing.svelte";

	let { data } = $props();
	const { products, subscriptions, user } = $derived(data);
</script>

<Pricing {products} {subscriptions} {user} />
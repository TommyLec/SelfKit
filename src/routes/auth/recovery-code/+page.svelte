<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
</script>

<div class="  mx-auto sm:max-w-[350px] p-5 sm:p-0">
	<div class="grid gap-6 text-center">
		<div>
			<h1 class="text-2xl font-bold">{m.wild_east_bullock_snip()}</h1>
		</div>

		<div class="border rounded-md mt-2 p-1">
			<p class="text-xl">{data.recoveryCode}</p>
		</div>

		<p>{m.warm_jolly_wallaby_blend()}</p>
		<Button href="/">{m.every_last_jackdaw_quell()}</Button>
	</div>
</div>

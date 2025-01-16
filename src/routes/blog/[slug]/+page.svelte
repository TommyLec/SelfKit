<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { formatDate } from '$lib/utils';

	let { data } = $props();
</script>

<article class="grid w-3/4 max-w-3xl m-auto my-10">
	<hgroup>
		<h1 class="text-6xl font-bold capitalize">{data.meta.title}</h1>
		<p class="text-muted-foreground">Published at {formatDate(data.meta.date)}</p>
	</hgroup>

	<div class="flex gap-1">
		{#each data.meta.categories as category}
			<Badge variant="outline">{category}</Badge>
		{/each}
	</div>

	<div class="post">
		<data.content />
	</div>
</article>
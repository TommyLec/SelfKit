<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { formatDate } from '$lib/utils';

	let { data } = $props()
</script>

<section class="grid md:grid-cols-2 grid-cols-1 gap-16 w-max m-auto my-10">
		{#each data.posts.filter(post => post.published) as post}
		<div class="grid gap-2 w-80 mx-auto mb-auto">
			<a class="text-4xl font-bold hover:underline" href={"/blog/" + post.slug}>
				<img class="m-auto bg-cover rounded-md max-h-52 w-full" alt={post.title + ' image'} src={'../' + post.image} />
				{post.title}
			</a>
			<p class=" font-thin">{post.description}</p>
			<p class="text-xs">{formatDate(post.date)}</p>
			<div class="flex gap-1">
				{#each post.categories as category}
					<Badge variant="outline">{category}</Badge>
				{/each}
			</div>
		</div>
		{/each}
</section>
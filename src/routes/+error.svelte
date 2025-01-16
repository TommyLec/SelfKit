<script>
	// @ts-nocheck The attributes 'code' does not exist in Error for Typescript, but he is initialized in the [hook.server.ts file](../hooks.server.ts)
	import Button from '$lib/components/ui/button/button.svelte';
	import { page } from '$app/state';
	import { config } from '$lib/selfkit.config';
</script>

{#if page.error?.code === 404}
	<div class="text-center m-auto">
		<h1 class="flex flex-col font-bold">404 <span>{m.tense_cozy_swan_nourish()}</span></h1>
		<p class="my-5 text-muted-foreground text-xl">
			{m.north_left_husky_drop()}
		</p>
		<Button class="mt-5" href="/">{m.small_full_weasel_devour()}</Button>
	</div>
{:else}
	<div class="text-center m-auto">
		<h1 class="flex flex-col font-bold">
			{page.error?.code} <span>{m.every_less_parakeet_advise()}</span>
		</h1>
		<div class="grid gap-3 my-5 text-muted-foreground text-xl">
			<p>{m.heavy_bald_flamingo_express()}</p>
			<p>
				{m.spicy_away_octopus_climb()}<a
					class="text-muted-foreground underline hover:text-primary"
					href={`mailto:${config.emailSupport}`}>{config.emailSupport}</a
				>
			</p>
		</div>
		<Button class="mt-5" href="/">{m.early_mean_slug_sing()}</Button>
	</div>
{/if}

<style>
	h1 {
		font-size: 5rem;
		line-height: 1;
	}
	h1 > span {
		font-size: 3rem;
		line-height: 1;
	}
</style>

<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
    import { type BentoCardProps } from '$lib/types/bentoGrid';

	let { name, background, icon, description, href, cta, color, class: className }: BentoCardProps = $props();
	const Background = $derived(background);
</script>

<div
	id={name}
	style={`--card-color: ${color};`}
	class={cn(
		'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl border hover:border-[var(--card-color)]',
		// light styles
		'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
		// dark styles
		'transform-gpu dark:bg-background',
		className
	)}
>
	<div class="transition-all duration-300 ease-out -translate-y-16 md:-translate-y-5 scale-75 group-hover:scale-90">
		<Background></Background>
	</div>
	<div
		class={cn("absolute bottom-0 pointer-events-none z-10 transform-gpu flex-col gap-1 p-6 ", cta ? 'transition-all duration-300 group-hover:-translate-y-10' : '')}
	>
		<Icon
			{icon}
			{color}
			class="h-12 w-12 origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-75"
		/>

		<h3 class="text-2xl font-bold">
			{name}
		</h3>
		<p class="max-w-max text-neutral-400">{description}</p>
	</div>

	{#if cta}
		<div
			class={cn(
				'pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'
			)}
		>
			<Button variant="ghost" size="sm" class="pointer-events-auto">
				<a {href} class="flex justify-center items-center">
					{cta}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="ml-2 h-4 w-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
					>
				</a>
			</Button>
		</div>
	{/if}
	<div
		class="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10"
	></div>
</div>

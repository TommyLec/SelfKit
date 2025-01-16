<script lang="ts">
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { inview } from 'svelte-inview';

	let inView = $state(false);
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		inView = detail.inView;
	};
</script>

<section
	use:inview={{
		unobserveOnEnter: true,
		rootMargin: '-100px'
	}}
	oninview_change={handleChange}
	class={cn(
		'w-full -translate-y-4 animate-fade-in gap-1 transition-opacity ease-in-out [--animation-delay:600ms] my-28 md:my-36 bg-secondary p-5 md:p-10',
		inView ? 'opacity-100' : 'opacity-0'
	)}
>
	<div class="my-10 text-2xl lg:text-3xl md:w-2/3 font-semibold mx-auto">
		Skyrocketing monthly costs and the hassle of managing countless third-party services are slowing
		you down.
	</div>
	<div class="flex flex-col md:flex-row gap-10 justify-center items-center text-xl mb-10">
		<div class="grid gap-1">
			<Icon class="m-auto w-7 h-7" icon="mdi:head-cog-outline" />
			Integration Headaches
		</div>
		<Icon class="rotate-180 md:rotate-90" icon="akar-icons:arrow-up" />
		<div>
			<Icon class="m-auto w-7 h-7" icon="mingcute:time-line" />
			Time Drain
		</div>
		<Icon class="rotate-180 md:rotate-90" icon="akar-icons:arrow-up" />
		<div>
			<Icon class="m-auto w-7 h-7" icon="carbon:locked" />
			Limited Control
		</div>
		<Icon class="rotate-180 md:rotate-90" icon="akar-icons:arrow-up" />
		<div>
			<Icon class="m-auto w-7 h-7" icon="streamline:graph-arrow-increase" />
			Rising Costs
		</div>
	</div>
</section>

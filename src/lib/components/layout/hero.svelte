<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '../ui/button';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { inview } from 'svelte-inview';

	let inView = $state(false);
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		inView = detail.inView;
	};
</script>

<div class="w-full text-center flex flex-col justify-center items-center">
	<section
		class="flex m-auto"
		use:inview={{
			unobserveOnEnter: true,
			rootMargin: '-100px'
		}}
		oninview_change={handleChange}
	>
		<div class="text-center md:text-left flex-1 px-3 md:px-10 lg:px-16">
			<h1
				class={cn(
					'-translate-y-4 animate-fade-in text-balance py-10 text-5xl font-medium leading-none tracking-tighter transition-opacity opacity-0 [--animation-duration:1000ms] dark:from-white dark:to-white/40 sm:text-6xl lg:text-8xl mt-10',
					inView ? 'opacity-100' : ''
				)}
			>
				SelfKit demo
			</h1>
			<p
				class={cn(
					'mb-12 -translate-y-4 animate-fade-in text-balance text-lg tracking-tight text-gray-400 transition-opacity [--animation-delay:400ms] md:text-xl',
					inView ? 'opacity-100' : 'opacity-0'
				)}
			>
				This demo show you what you will get with SelfKit!
			</p>

			<div class="grid gap-2 mx-auto md:mx-0 w-2/3">
				<Button
					size="lg"
					class={cn(
						'-translate-y-4 animate-fade-in gap-1 rounded-lg transition-opacity ease-in-out [--animation-delay:600ms] ',
						inView ? 'opacity-100' : 'opacity-0'
					)}
					href="/payment"
				>
					Get Selfkit demo
				</Button>
			</div>
		</div>

		<div class="hidden md:block flex-1 p-5 md:px-10 lg:px-16">
			<img class="w-full h-full object-cover rounded-lg" src="example2.webp" alt="Hero example" />
		</div>
	</section>
</div>

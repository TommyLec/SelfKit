<script>
	import { config } from '$lib/selfkit.config';

	let sections = [
		{
			name: 'Product',
			items: [
				{
					name: 'Pricing',
					href: '/payment'
				},
				{
					name: 'FAQ',
					href: '/faq'
				}
			]
		},
		{
			name: 'Company',
			items: [
				{
					name: 'Terms of services',
					href: '/legals/terms-of-services'
				},
				{
					name: 'Privacy policy',
					href: '/legals/privacy'
				},
				{
					name: 'Refund policy',
					href: '/legals/refund-policy'
				},
				{
					name: 'Contact',
					href: '/contact'
				}
			]
		},
		{
			name: 'Others',
			items: [
				{
					name: 'Blog',
					href: '/blog'
				}
			]
		}
	];
</script>

<footer class="w-full p-10 border-t backdrop-blur-xl">
	<div class="grid sm:grid-flow-col gap-8 text-sm pb-16">
		<a class="flex items-center gap-2 w-fit sm:col-span-2" aria-label="SelfKit" href="/">
			<svg width="50" height="50" viewBox="0 0 528 616" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M0 172C0 160.954 7.45043 156.967 16.641 163.094L232.974 307.316C242.165 313.443 249.615 327.364 249.615 338.41V428.41C249.615 439.456 242.165 443.443 232.974 437.316L16.641 293.094C7.45043 286.967 0 273.046 0 262V172Z" fill="#08ADB7"/>
				<path d="M0 347C0 335.954 7.45043 331.967 16.641 338.094L232.974 482.316C242.165 488.443 249.615 502.364 249.615 513.41V603.41C249.615 614.456 242.165 618.443 232.974 612.316L16.641 468.094C7.45043 461.967 0 448.046 0 437V347Z" fill="#08ADB7"/>
				<path d="M278 338.41C278 327.364 285.45 313.443 294.641 307.316L510.974 163.094C520.165 156.967 527.615 160.954 527.615 172V262C527.615 273.046 520.165 286.967 510.974 293.094L294.641 437.316C285.45 443.443 278 439.456 278 428.41V338.41Z" fill="#0F2650"/>
				<path d="M278 513.41C278 502.364 285.45 488.443 294.641 482.316L510.974 338.094C520.165 331.967 527.615 335.954 527.615 347V437C527.615 448.046 520.165 461.967 510.974 468.094L294.641 612.316C285.45 618.443 278 614.456 278 603.41V513.41Z" fill="#0F2650"/>
				<path d="M242.645 5.51142C251.678 -0.846153 266.478 -1.07463 275.703 5.00112L465.015 129.692C474.24 135.768 474.396 145.847 465.363 152.204L287.106 277.669C278.073 284.027 263.273 284.255 254.048 278.18L64.7355 153.489C55.5109 147.413 55.3554 137.334 64.388 130.977L242.645 5.51142Z" fill="#08ADB7"/>
			</svg>
			
			<span class="text-lg font-bold">SelfKit</span>
		</a>
		{#each sections as section}
			<div class="w-fit">
				<h4 class="font-semibold mb-4 uppercase">{section.name}</h4>
				<nav class="grid gap-2" aria-label={`${section.name} menu`}>
					{#each section.items as { name, href }}
						<a class="text-muted-foreground hover:underline hover:text-primary" {href}> {name} </a>
					{/each}
				</nav>
			</div>
		{/each}
	</div>
	<aside class="border-t w-full pt-5 mt-5">
		<p class="text-xs antialiased text-start">
			Copyright @ {config.appName}
			{new Date().getFullYear()}
		</p>
	</aside>

	<div class="flex justify-center items-center text-xs font-light"><span class="flex items-center justify-center border px-2 py-1 rounded-lg">Built with 
		<svg class="px-1" width="20" height="20" viewBox="0 0 528 616" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 172C0 160.954 7.45043 156.967 16.641 163.094L232.974 307.316C242.165 313.443 249.615 327.364 249.615 338.41V428.41C249.615 439.456 242.165 443.443 232.974 437.316L16.641 293.094C7.45043 286.967 0 273.046 0 262V172Z" fill="#08ADB7"/>
			<path d="M0 347C0 335.954 7.45043 331.967 16.641 338.094L232.974 482.316C242.165 488.443 249.615 502.364 249.615 513.41V603.41C249.615 614.456 242.165 618.443 232.974 612.316L16.641 468.094C7.45043 461.967 0 448.046 0 437V347Z" fill="#08ADB7"/>
			<path d="M278 338.41C278 327.364 285.45 313.443 294.641 307.316L510.974 163.094C520.165 156.967 527.615 160.954 527.615 172V262C527.615 273.046 520.165 286.967 510.974 293.094L294.641 437.316C285.45 443.443 278 439.456 278 428.41V338.41Z" fill="#0F2650"/>
			<path d="M278 513.41C278 502.364 285.45 488.443 294.641 482.316L510.974 338.094C520.165 331.967 527.615 335.954 527.615 347V437C527.615 448.046 520.165 461.967 510.974 468.094L294.641 612.316C285.45 618.443 278 614.456 278 603.41V513.41Z" fill="#0F2650"/>
			<path d="M242.645 5.51142C251.678 -0.846153 266.478 -1.07463 275.703 5.00112L465.015 129.692C474.24 135.768 474.396 145.847 465.363 152.204L287.106 277.669C278.073 284.027 263.273 284.255 254.048 278.18L64.7355 153.489C55.5109 147.413 55.3554 137.334 64.388 130.977L242.645 5.51142Z" fill="#08ADB7"/>
		</svg>
		SelfKit</span></div>
</footer>

<style>
	footer {
		view-transition-name: footer;
	}
</style>


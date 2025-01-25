<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.ts';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { User } from '$lib/server/auth/user';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { cn } from '$lib/utils';
	import Lightswitch from '../lightswitch.svelte';
	import type { SubscriptionDetails } from '$lib/types/subscriptionDetails';

	let { user, subscriptions }: { user: User | null; subscriptions: SubscriptionDetails[] } =
		$props();

	const menu = [
		{
			title: 'Home',
			href: '/'
		},
		{
			title: 'Pricing',
			href: '/payment'
		},
		{
			title: 'Contact',
			href: '/contact'
		},
		{
			title: 'Blog',
			href: '/blog'
		},
		{
			title: 'FAQ',
			href: '/faq'
		}
	];

	const accountMenu = [
		{
			title: 'Profile',
			href: '/account'
		},
		{
			title: 'Subscription',
			href: '/account/subscription'
		},
		{
			title: 'Settings',
			href: '/account/settings'
		}
	];
</script>

{#snippet titles(classname?: string)}
	{#each menu as { title, href }}
		<Button
			variant="link"
			{href}
			class={cn(page.url.pathname === href ? '' : 'text-opacity-70', classname)}>{title}</Button
		>
	{/each}
{/snippet}

<nav
	aria-label="Site menu"
	class="flex items-center justify-between sticky top-0 w-full h-[55px] backdrop-blur-xl border-b px-3 z-50"
>
	<div class="grow basis-1 ml-2 hidden md:block">
		<a class="flex items-center gap-2 w-fit" aria-label="SelfKit" href="/">
			<svg
				width="30"
				height="30"
				viewBox="0 0 528 616"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M0 172C0 160.954 7.45043 156.967 16.641 163.094L232.974 307.316C242.165 313.443 249.615 327.364 249.615 338.41V428.41C249.615 439.456 242.165 443.443 232.974 437.316L16.641 293.094C7.45043 286.967 0 273.046 0 262V172Z"
					fill="#08ADB7"
				/>
				<path
					d="M0 347C0 335.954 7.45043 331.967 16.641 338.094L232.974 482.316C242.165 488.443 249.615 502.364 249.615 513.41V603.41C249.615 614.456 242.165 618.443 232.974 612.316L16.641 468.094C7.45043 461.967 0 448.046 0 437V347Z"
					fill="#08ADB7"
				/>
				<path
					d="M278 338.41C278 327.364 285.45 313.443 294.641 307.316L510.974 163.094C520.165 156.967 527.615 160.954 527.615 172V262C527.615 273.046 520.165 286.967 510.974 293.094L294.641 437.316C285.45 443.443 278 439.456 278 428.41V338.41Z"
					fill="#0F2650"
				/>
				<path
					d="M278 513.41C278 502.364 285.45 488.443 294.641 482.316L510.974 338.094C520.165 331.967 527.615 335.954 527.615 347V437C527.615 448.046 520.165 461.967 510.974 468.094L294.641 612.316C285.45 618.443 278 614.456 278 603.41V513.41Z"
					fill="#0F2650"
				/>
				<path
					d="M242.645 5.51142C251.678 -0.846153 266.478 -1.07463 275.703 5.00112L465.015 129.692C474.24 135.768 474.396 145.847 465.363 152.204L287.106 277.669C278.073 284.027 263.273 284.255 254.048 278.18L64.7355 153.489C55.5109 147.413 55.3554 137.334 64.388 130.977L242.645 5.51142Z"
					fill="#08ADB7"
				/>
			</svg>

			<span class="text-lg font-bold">SelfKit</span>
		</a>
	</div>
	<div class="hidden md:block">
		{@render titles()}
	</div>
	<div class="block md:hidden">
		<Sheet.Root>
			<Sheet.Trigger><Icon class="w-5 h-5" icon="line-md:menu" /></Sheet.Trigger>
			<Sheet.Content side="left" style="view-transition-name: sheet;">
				<Sheet.Header>
					<Sheet.Title>
						<a class="flex items-center gap-2 w-fit" aria-label="SelfKit" href="/">
							<svg
								width="30"
								height="30"
								viewBox="0 0 528 616"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M0 172C0 160.954 7.45043 156.967 16.641 163.094L232.974 307.316C242.165 313.443 249.615 327.364 249.615 338.41V428.41C249.615 439.456 242.165 443.443 232.974 437.316L16.641 293.094C7.45043 286.967 0 273.046 0 262V172Z"
									fill="#08ADB7"
								/>
								<path
									d="M0 347C0 335.954 7.45043 331.967 16.641 338.094L232.974 482.316C242.165 488.443 249.615 502.364 249.615 513.41V603.41C249.615 614.456 242.165 618.443 232.974 612.316L16.641 468.094C7.45043 461.967 0 448.046 0 437V347Z"
									fill="#08ADB7"
								/>
								<path
									d="M278 338.41C278 327.364 285.45 313.443 294.641 307.316L510.974 163.094C520.165 156.967 527.615 160.954 527.615 172V262C527.615 273.046 520.165 286.967 510.974 293.094L294.641 437.316C285.45 443.443 278 439.456 278 428.41V338.41Z"
									fill="#0F2650"
								/>
								<path
									d="M278 513.41C278 502.364 285.45 488.443 294.641 482.316L510.974 338.094C520.165 331.967 527.615 335.954 527.615 347V437C527.615 448.046 520.165 461.967 510.974 468.094L294.641 612.316C285.45 618.443 278 614.456 278 603.41V513.41Z"
									fill="#0F2650"
								/>
								<path
									d="M242.645 5.51142C251.678 -0.846153 266.478 -1.07463 275.703 5.00112L465.015 129.692C474.24 135.768 474.396 145.847 465.363 152.204L287.106 277.669C278.073 284.027 263.273 284.255 254.048 278.18L64.7355 153.489C55.5109 147.413 55.3554 137.334 64.388 130.977L242.645 5.51142Z"
									fill="#08ADB7"
								/>
							</svg>

							<span class="text-lg font-bold">SelfKit</span>
						</a>
					</Sheet.Title>
					<Sheet.Description class="grid gap-2 items-start text-start">
						{@render titles('text-lg justify-self-start')}
					</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
	</div>

	<div class="flex gap-2 grow basis-1 justify-end">
		{#if subscriptions && subscriptions.length > 0}
			<Button href="/app">Dashboard</Button>
		{/if}
		<Lightswitch />
		{#if user}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger name="Account"
					><Icon class="w-5 h-5" icon="mdi:account-outline" /></DropdownMenu.Trigger
				>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading>Account</DropdownMenu.GroupHeading>
						<DropdownMenu.Separator />
						{#each accountMenu as { title, href }}
							<DropdownMenu.Item><a {href}>{title}</a></DropdownMenu.Item>
						{/each}
						<DropdownMenu.Separator />
						<DropdownMenu.Item class="font-semibold text-destructive">
							<form method="POST" action="/auth?/signout">
								<button>Sign out</button>
							</form>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button href="/payment">Get Selfkit demo</Button>
		{/if}
	</div>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		view-transition-name: header;
	}
</style>

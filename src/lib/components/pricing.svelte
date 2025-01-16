<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { type Paddle, initializePaddle } from '@paddle/paddle-js';
	import * as Card from '$lib/components/ui/card';
	import { type ProductVariant } from '$lib/server/database/schemas/productsSchema.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { type CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events.js';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { mode as themeMode } from 'mode-watcher';
	import { cn, getHumanPrice } from '$lib/utils';
	import { type ProductWithVariants } from '$lib/server/database/productService';
	import type { SubscriptionDetails } from '$lib/types/subscriptionDetails';
	import { fly } from 'svelte/transition';
	import type { User } from '$lib/server/auth/user';
	import { config } from '$lib/selfkit.config';
	import { dev } from '$app/environment';

	type Props = {
		products: ProductWithVariants;
		subscriptions: SubscriptionDetails[];
		user: User | null;
	};

	let { products, subscriptions, user }: Props = $props();

	let annually: boolean = $state(false);
	let checkoutData: CheckoutEventsData | undefined = $state();

	const getLanguage = () =>
		navigator.languages && navigator.languages.length
			? navigator.languages[0]
			: navigator.language || 'en';

	let paddle: Paddle | undefined;
	$effect(() => {
		initializePaddle({
			environment: dev ? 'sandbox' : 'production',
			token: env.PUBLIC_PADDLE_CLIENT_TOKEN!,
			checkout: {
				settings: {
					frameTarget: 'checkout-container',
					frameInitialHeight: 450,
					frameStyle: 'width: 100%; min-width: 312px;'
				}
			},
			eventCallback: (event) => {
				if (!event.name) return;
				checkoutData = event.data;
			}
		}).then((paddleInstance) => {
			paddle = paddleInstance;
		});
	});

	function purchaseProduct(priceId: string) {
		if (!user) {
			goto('/auth/login');
		}
		paddle?.Checkout.open({
			settings: {
				displayMode: 'overlay',
				variant: 'one-page',
				theme: $themeMode,
				locale: getLanguage()
			},
			customer: {
				email: user ? user.email : ""
			},
			items: [{ priceId, quantity: 1 }]
		});
	}

	function isProductSubscribed(productId: number): boolean {
		if (!subscriptions) return false;
		return subscriptions.some(
			(details) => details.product.id === productId && details.subscription.status === 'active'
		);
	}

	function isOnlyOneTime(): boolean {
		return !products.find(p => p.variants.find(v => v.billingPeriod !== null));
	}
</script>

{#snippet ProductCard(product: any, highlight?: boolean, index?: number)}
	<!-- Get the variant according to the billingPeriod -->
	{@const variant = product.variants.find(
		(variant: ProductVariant) => variant.billingPeriod === (annually ? 'annually' : 'monthly') || !variant.billingPeriod
	)}
	<Card.Root class={cn('w-[350px] p-3 flex flex-col mt-10', highlight ? 'border-primary' : '')}>
		<Card.Header>
			<Card.Title class="grid gap-2">
				{#if product.iconUrl}
					<img
						class=" object-contain w-[100px] h-[100px]"
						src={product.iconUrl}
						alt={product.name}
					/>
				{/if}
				<h4 class="text-2xl">{product.name}</h4>
			</Card.Title>
			<Card.Description>{product.description}</Card.Description>
		</Card.Header>
		<Card.Content>
			{#key variant}
				<div in:fly={{ y: 20, duration: 300, delay: (index ?? 1) * 80 }} class="text-5xl font-bold text-center mb-5">
					{getHumanPrice(variant.price, variant.currency)}
					{#if variant.billingPeriod}
						<span class=" text-sm"
							>/ {variant.billingPeriod === 'monthly'
								? m.neat_upper_elephant_lift()
								: m.every_fair_pony_nail()}</span
						>
					{/if}
				</div>
			{/key}
			<div class="card-content">
				{@html product.details}
			</div>
		</Card.Content>
		<Card.Footer class="mt-auto">
			{#if isProductSubscribed(product.id)}
				<div class="font-bold italic">{m.tasty_level_marten_nail()}</div>
			{:else}
				<div class="w-full grid text-center">
					<Button
						id="purchase-button"
						data-umami-event="Purchase button"
						data-umami-event-product={product.name}
						data-umami-event-period={variant.billingPeriod}
						data-umami-event-currency={variant.currency}
						class="w-full"
						onclick={() => {
							purchaseProduct(variant.extVariantId);
						}}
						>Get {config.appName}</Button
					>

					{#if !variant.billingPeriod}
						<span class="text-sm text-muted-foreground mt-1">{m.such_active_buzzard_glow()}</span>
					{/if}
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
{/snippet}

{#if !isOnlyOneTime()}
	<div class="flex justify-center items-center space-x-2 mt-10 mb-3">
		<Label for="billingMode">{m.maroon_left_lemming_fall()}</Label>
		<Switch bind:checked={annually} id="billingMode" />
		<Label for="billingMode">{m.polite_few_vulture_cure()}</Label>
	</div>
{/if}

<div class="flex flex-col md:flex-row items-center md:items-stretch text-left justify-center gap-6 mb-10">
	{#each products as product, i}
		{@render ProductCard(product, false, i)}
	{/each}
</div>

<div class="checkout-container w-full"></div>
<script lang="ts">
    import BentoGrid from '$lib/components/ui/bento-grid/bentoGrid.svelte';

	let features = [
		{
			icon: 'mdi:account',
			name: 'Authentication',
			description: 'Google login, 2FA, Rate limiting, Password checking',
			color: '#7157FF',
			background: null,
			class: 'col-span-3 lg:col-span-1'
		},
		{
			icon: 'fluent:payment-16-filled',
			name: 'Payment',
			description: 'Checkout, User subscription and product auto update, No hidden fees',
			color: '#353D2E',
			background: null,
			class: 'col-span-3 lg:col-span-2'
		},
		{
			icon: 'heroicons-solid:search',
			name: 'SEO',
			description:
				'Blog with markdown and RSS, Meta tags, Open graph for socials, JSON-LD for search results',
			color: '#C5F74F',
			background: null,
			class: 'col-span-3 lg:col-span-2'
		},
		{
			icon: 'gg:more-o',
			name: 'And more...',
			description: '',
			color: '#7157FF',
			background: null,
			class: 'col-span-3 lg:col-span-1'
		}
	];
</script>

<BentoGrid items={features} />
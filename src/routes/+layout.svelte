<script>
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import { onNavigate } from '$app/navigation';
	import Navbar from '$lib/components/layout/navbar.svelte';
	import '../app.css';
	import { page } from '$app/state';
	import Seo from '$lib/seo/seo.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();
	let { user, subscriptions } = $derived(data);

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<ModeWatcher />

<ParaglideJS {i18n}>
	<Seo
		pageName={page.data.pageName}
		description={page.data.description}
		products={page.data.products}
		keywords={page.data.keywords}
		imgUrl={page.data.imgUrl}
		imgAlt={page.data.imgAlt}
	/>

	<Navbar {user} {subscriptions}/>

	{@render children()}

	<Footer />
</ParaglideJS>

<style>
	/* Page transition animation */
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateY(-30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateY(30px);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		:root::view-transition-old(root) {
			animation:
				90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
				300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
		}

		:root::view-transition-new(root) {
			animation:
				210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
				300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
		}
	}

	/* Scrollbar */
	:global(::-webkit-scrollbar) {
		width: 0.25rem;
	}

	:global(::-webkit-scrollbar-thumb) {
		--tw-bg-opacity: 1;
		border-radius: 1rem;
		background-color: rgb(38 38 38 / var(--tw-bg-opacity));
	}
</style>

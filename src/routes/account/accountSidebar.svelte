<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	const menu = [
		{
			title: 'Profile',
			href: '/account',
			icon: 'mdi:account-outline'
		},
		{
			title: 'Subscription',
			href: '/account/subscription',
			icon: 'streamline:subscription-cashflow'
		},
		{
			title: 'Settings',
			href: '/account/settings',
			icon: 'material-symbols:settings-outline'
		}
	];
</script>

<nav aria-label="Account menu">
	<Sidebar.Root class="mt-[55px]">
		<Sidebar.Header />
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each menu as { title, href, icon }}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === href}>
									{#snippet child({ props })}
										<a {href} {...props}><Icon {icon} />{title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer />
	</Sidebar.Root>
</nav>

<style>
	nav {
		view-transition-name: sidebar;
	}
</style>

<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AccountSidebar from "./accountSidebar.svelte";

    let { children } = $props();
</script>

<Sidebar.Provider>
    <AccountSidebar />
    <main class="w-full">
        <Sidebar.Trigger />
        {@render children()}
    </main>
</Sidebar.Provider>